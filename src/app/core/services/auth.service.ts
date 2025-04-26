import {
  computed,
  DestroyRef,
  effect,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { AnonymousIdentity, Identity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { connect } from 'ngxtension/connect';
import {
  from,
  map,
  mergeWith,
  ReplaySubject,
  connect as rxConnect,
  Subject,
  switchMap,
} from 'rxjs';

import { AUTH_MAX_TIME_TO_LIVE } from '@core/constants';
import { AuthClientLogoutOptions, IAuthService } from '@core/models/auth';
import { assertClient } from '@core/utils';
import { environment } from '@environments/environment';

interface State {
  client: AuthClient | null;
  identity: Identity;
  isAuthenticated: boolean;
  ready: boolean;
}

const INITIAL_VALUE: State = {
  client: null,
  identity: new AnonymousIdentity(),
  isAuthenticated: false,
  ready: false,
};

@Injectable()
export class AuthService implements IAuthService {
  #state = signal(INITIAL_VALUE);
  identity = computed(() => this.#state().identity);
  isAuthenticated = computed(() => this.#state().isAuthenticated);
  principalId = computed(() => this.#state().identity.getPrincipal().toText());
  ready$ = toObservable(this.#state).pipe(map(({ ready }) => ready));
  #destroyRef = inject(DestroyRef);
  #refresh = new Subject<void>();

  constructor() {
    this.#initState();
    effect(() => console.info(`Principal ID: ${this.principalId()}`));
  }

  async signIn() {
    const { client } = this.#state();

    assertClient(client);

    client.login({
      identityProvider: environment.identityProviderUrl,
      maxTimeToLive: AUTH_MAX_TIME_TO_LIVE,
      onSuccess: () => this.#refresh.next(),
    });
  }

  async signOut(opts?: AuthClientLogoutOptions) {
    const { client } = this.#state();

    assertClient(client);

    await client.logout(opts);
    this.#refresh.next();
  }

  #initState() {
    const authClient$ = from(AuthClient.create()).pipe(
      rxConnect(
        (shared) =>
          shared.pipe(
            mergeWith(
              this.#refresh.asObservable().pipe(switchMap(() => shared)),
            ),
            map((client) => ({ client, identity: client.getIdentity() })),
            rxConnect((shared) =>
              shared.pipe(
                mergeWith(
                  shared.pipe(
                    switchMap(({ client }) => client.isAuthenticated()),
                    map((isAuthenticated) => ({
                      isAuthenticated,
                      ready: true,
                    })),
                  ),
                ),
              ),
            ),
          ),
        { connector: () => new ReplaySubject(1) },
      ),
    );

    connect(this.#state, authClient$, this.#destroyRef);
  }
}
