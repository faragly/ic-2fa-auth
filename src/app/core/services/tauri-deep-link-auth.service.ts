import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { AnonymousIdentity, SignIdentity } from '@dfinity/agent';
import { AuthClient, AuthClientCreateOptions } from '@dfinity/auth-client';
import {
  DelegationChain,
  DelegationIdentity,
  ECDSAKeyIdentity,
  isDelegationValid,
  JsonnableDelegationChain,
} from '@dfinity/identity';
import { open } from '@tauri-apps/plugin-shell';
import { connect } from 'ngxtension/connect';
import { filterNil } from 'ngxtension/filter-nil';
import { filter, from, map, mergeWith, repeat, connect as rxConnect, switchMap, takeUntil, timer } from 'rxjs';
import { Buffer } from 'buffer';
import { isMatching, P } from 'ts-pattern';
import { AuthClientLogoutOptions, IAuthService } from '@core/models/auth';
import { onOpenUrlObservable } from '@core/operators';
import { assertClient } from '@core/utils';
import { environment } from '@environments/environment';

function assertDelegationIdentity(identity: AnonymousIdentity | SignIdentity): asserts identity is SignIdentity {
  if (!isMatching(P.instanceOf(SignIdentity), identity)) throw Error('The sign identity is not provided');
}

interface State {
  client: AuthClient | null;
  delegationChain: DelegationChain | null;
  identity: AnonymousIdentity | SignIdentity;
  isAuthenticated: boolean;
}

const INITIAL_VALUE: State = {
  client: null,
  delegationChain: null,
  identity: new AnonymousIdentity(),
  isAuthenticated: false,
};

@Injectable()
export class TauriDeepLinkAuthService implements IAuthService {
  #destroyRef = inject(DestroyRef);
  #state = signal(INITIAL_VALUE);
  client = computed(() => this.#state().client);
  identity = computed(() => this.#state().identity);
  isAuthenticated = computed(() => {
    const { delegationChain, isAuthenticated } = this.#state();
    return delegationChain !== null && isDelegationValid(delegationChain) && isAuthenticated;
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

  #createIdentityFromDelegation(url: string) {
    const { identity } = this.#state();

    assertDelegationIdentity(identity);

    // Get JSON from deep link query param
    const encodedDelegationChain = url.replace(`${environment.scheme}://internetIdentityCallback?delegationChain=`, '');
    const json: JsonnableDelegationChain = JSON.parse(decodeURIComponent(encodedDelegationChain));
    const delegationChain: DelegationChain = DelegationChain.fromJSON(json);

    // Here we create an identity with the delegation chain we received from the website
    const internetIdentity = DelegationIdentity.fromDelegation(identity, delegationChain);
    this.#state.update((state) => ({
      ...state,
      delegationChain,
      identity: internetIdentity,
      isAuthenticated: true,
    }));
  }

  #initDelegationChecker() {
    const delegationChain$ = toObservable(this.#state).pipe(map(({ delegationChain }) => delegationChain));
    const on$ = delegationChain$.pipe(filterNil());
    const off$ = delegationChain$.pipe(filter((v) => v === null));
    on$
      .pipe(
        switchMap((delegationChain) => {
          const expirationTimeMs = Number(delegationChain.delegations[0].delegation.expiration / 1000000n);
          return timer(expirationTimeMs - Date.now()).pipe(filter(() => !isDelegationValid(delegationChain)));
        }),
        takeUntil(off$),
        repeat(),
        takeUntilDestroyed(),
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
      }),
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
                    disableDefaultIdleCallback: true,
                    disableIdle: true,
                  },
                  // noop storage
                  storage: {
                    get: () => Promise.resolve(null),
                    remove: () => Promise.resolve(),
                    set: () => Promise.resolve(),
                  },
                };
                return AuthClient.create(options);
              }),
              map((client) => ({ client })),
            ),
          ),
        ),
      ),
    );

    connect(this.#state, authClient$, this.#destroyRef);
  }

  async signIn() {
    const { identity } = this.#state();

    assertDelegationIdentity(identity);

    const publicKey = Buffer.from(identity.getPublicKey().toDer()).toString('hex');
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
