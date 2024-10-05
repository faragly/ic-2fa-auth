import {
  DestroyRef,
  Injectable,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  DelegationChain,
  DelegationIdentity,
  ECDSAKeyIdentity,
  JsonnableDelegationChain,
  isDelegationValid,
} from '@dfinity/identity';
import { open } from '@tauri-apps/plugin-shell';
import { Buffer } from 'buffer';
import {
  filter,
  from,
  map,
  repeat,
  switchMap,
  takeUntil,
  timer,
  connect as rxConnect,
  mergeWith,
} from 'rxjs';
import { connect } from 'ngxtension/connect';
import { filterNil } from 'ngxtension/filter-nil';
import { AnonymousIdentity, SignIdentity } from '@dfinity/agent';
import { isMatching, P } from 'ts-pattern';

import { environment } from '@environments/environment';
import { AuthClientLogoutOptions, IAuthService } from '@core/models/auth';
import { onOpenUrlObservable } from '@core/operators';
import { assertClient } from '@core/utils';
import { AuthClient, AuthClientCreateOptions } from '@dfinity/auth-client';

function assertDelegationIdentity(
  identity: SignIdentity | AnonymousIdentity
): asserts identity is SignIdentity {
  if (!isMatching(P.instanceOf(SignIdentity), identity))
    throw Error('The sign identity is not provided');
}

type State = {
  client: AuthClient | null;
  identity: SignIdentity | AnonymousIdentity;
  delegationChain: DelegationChain | null;
  isAuthenticated: boolean;
};

const INITIAL_VALUE: State = {
  client: null,
  identity: new AnonymousIdentity(),
  delegationChain: null,
  isAuthenticated: false,
};

@Injectable()
export class TauriDeepLinkAuthService implements IAuthService {
  #state = signal(INITIAL_VALUE);
  #destroyRef = inject(DestroyRef);
  client = computed(() => this.#state().client);
  isAuthenticated = computed(() => {
    const { delegationChain, isAuthenticated } = this.#state();
    return (
      delegationChain !== null &&
      isDelegationValid(delegationChain) &&
      isAuthenticated
    );
  });
  principalId = computed(() => this.#state().identity.getPrincipal().toText());

  constructor() {
    this.#initState();
    this.#initDelegationChecker();
    onOpenUrlObservable()
      .pipe(takeUntilDestroyed())
      .subscribe((urls) => {
        this.#createIdentityFromDelegation(urls[0]);
      });
    effect(() => console.info(`Principal ID: ${this.principalId()}`));
  }

  #initDelegationChecker() {
    const delegationChain$ = toObservable(this.#state).pipe(
      map(({ delegationChain }) => delegationChain)
    );
    const on$ = delegationChain$.pipe(filterNil());
    const off$ = delegationChain$.pipe(filter((v) => v === null));
    on$
      .pipe(
        switchMap((delegationChain) => {
          const expirationTimeMs = Number(
            delegationChain.delegations[0].delegation.expiration / 1000000n
          );
          return timer(expirationTimeMs - Date.now()).pipe(
            filter(() => !isDelegationValid(delegationChain))
          );
        }),
        takeUntil(off$),
        repeat(),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.signOut();
      });
  }

  #initState() {
    const authClient$ = from(
      ECDSAKeyIdentity.generate({
        extractable: false,
        keyUsages: ['sign', 'verify'],
      })
    ).pipe(
      rxConnect((shared) =>
        shared.pipe(
          map((identity) => ({ identity })),
          mergeWith(
            shared.pipe(
              switchMap((identity) => {
                const options: AuthClientCreateOptions = {
                  // Make Internet identity create a delegation chain for below identity
                  identity,
                  // Idle checks aren't needed
                  idleOptions: {
                    disableIdle: true,
                    disableDefaultIdleCallback: true,
                  },
                  // noop storage
                  storage: {
                    get: () => Promise.resolve(null),
                    set: () => Promise.resolve(),
                    remove: () => Promise.resolve(),
                  },
                };
                return AuthClient.create(options);
              }),
              map((client) => ({ client }))
            )
          )
        )
      )
    );

    connect(this.#state, authClient$, this.#destroyRef);
  }

  #createIdentityFromDelegation(url: string) {
    const { identity } = this.#state();

    assertDelegationIdentity(identity);

    // Get JSON from deep link query param
    const encodedDelegationChain = url.replace(
      `${environment.scheme}://internetIdentityCallback?delegationChain=`,
      ''
    );
    const json: JsonnableDelegationChain = JSON.parse(
      decodeURIComponent(encodedDelegationChain)
    );
    const delegationChain: DelegationChain = DelegationChain.fromJSON(json);

    // Here we create an identity with the delegation chain we received from the website
    const internetIdentity = DelegationIdentity.fromDelegation(
      identity,
      delegationChain
    );
    this.#state.update((state) => ({
      ...state,
      delegationChain,
      identity: internetIdentity,
      isAuthenticated: true,
    }));
  }

  async signIn() {
    const { identity } = this.#state();

    assertDelegationIdentity(identity);

    const publicKey = Buffer.from(identity.getPublicKey().toDer()).toString(
      'hex'
    );
    const url = `${environment.authUrl}?publicKey=${publicKey}`;
    // Here we open a browser and continue on the website
    await open(url);
  }

  signOut(options?: AuthClientLogoutOptions) {
    const { client } = this.#state();
    this.#state.update((state) => ({
      ...state,
      delegationChain: null,
      isAuthenticated: false,
    }));

    assertClient(client);

    return client.logout(options);
  }
}
