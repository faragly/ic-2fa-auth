import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { AnonymousIdentity, Identity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { connect } from 'ngxtension/connect';
import { from, map, mergeWith, ReplaySubject, connect as rxConnect, Subject, switchMap } from 'rxjs';
import { APP_DERIVATION_ORIGIN, AUTH_MAX_TIME_TO_LIVE, IDENTITY_PROVIDER_DEFAULT } from '@core/constants';
import { AuthClientLogoutOptions, IAuthService } from '@core/models/auth';
import { assertClient, isCustomDomain } from '@core/utils';
import { environment } from '@environments/environment';

interface State {
  client: AuthClient | null;
  identity: Identity;
  isAuthenticated: boolean;
}

const INITIAL_VALUE: State = {
  client: null,
  identity: new AnonymousIdentity(),
  isAuthenticated: false,
};

@Injectable()
export class AuthService implements IAuthService {
  #destroyRef = inject(DestroyRef);
  #refresh = new Subject<void>();
  #state = signal(INITIAL_VALUE);
  isAuthenticated = computed(() => this.#state().isAuthenticated);
  principalId = computed(() => this.#state().identity.getPrincipal().toText());

  constructor() {
    this.#initState();
    effect(() => console.info(`Principal ID: ${this.principalId()}`));
  }

  #initState() {
    const authClient$ = from(AuthClient.create()).pipe(
      rxConnect(
        (shared) =>
          shared.pipe(
            mergeWith(this.#refresh.asObservable().pipe(switchMap(() => shared))),
            map((client) => ({ client, identity: client.getIdentity() })),
            rxConnect((shared) =>
              shared.pipe(
                mergeWith(
                  shared.pipe(
                    switchMap(({ client }) => client.isAuthenticated()),
                    map((isAuthenticated) => ({ isAuthenticated })),
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

  async signIn() {
    const identityUrl =
      environment.production && import.meta.env.DFX_NETWORK === 'ic'
        ? IDENTITY_PROVIDER_DEFAULT
        : `http://${import.meta.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:8080/`;

    const { client } = this.#state();

    assertClient(client);

    client.login({
      identityProvider: identityUrl,
      maxTimeToLive: AUTH_MAX_TIME_TO_LIVE,
      ...(isCustomDomain() && {
        derivationOrigin: APP_DERIVATION_ORIGIN,
      }),
      onSuccess: () => this.#refresh.next(),
    });
  }

  async signOut(opts?: AuthClientLogoutOptions) {
    const { client } = this.#state();

    assertClient(client);

    await client.logout(opts);
    this.#refresh.next();
  }
}
