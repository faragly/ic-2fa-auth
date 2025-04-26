import {
  computed,
  DestroyRef,
  effect,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { AnonymousIdentity, SignIdentity } from '@dfinity/agent';
import {
  AuthClient,
  KEY_STORAGE_DELEGATION,
  KEY_STORAGE_KEY,
} from '@dfinity/auth-client';
import { toHexString } from '@dfinity/candid';
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
  JsonnableDelegationChain,
} from '@dfinity/identity';
import { JsonnableEd25519KeyIdentity } from '@dfinity/identity/lib/cjs/identity/ed25519';
import { onOpenUrl } from '@tauri-apps/plugin-deep-link';
import { openUrl } from '@tauri-apps/plugin-opener';
import { load } from '@tauri-apps/plugin-store';
import { map } from 'rxjs/operators';

import { AuthClientLogoutOptions, IAuthService } from '@core/models/auth';
import { waitDelegationExpired } from '@core/operators';
import { assertClient, createAuthClient } from '@core/utils';
import { environment } from '@environments/environment';

const STORE_PATH = 'store.json';

interface State {
  client: AuthClient | null;
  delegationChain: DelegationChain | null;
  identity: AnonymousIdentity | SignIdentity;
  isAuthenticated: boolean;
  ready: boolean;
}

export async function loadIdentity() {
  const store = await load(STORE_PATH, { autoSave: false });
  const identityJson = await store.get<string>(KEY_STORAGE_KEY);

  return identityJson
    ? Ed25519KeyIdentity.fromParsedJson(
        JSON.parse(identityJson) as JsonnableEd25519KeyIdentity,
      )
    : null;
}

export async function saveDelegationChain(delegationChain: DelegationChain) {
  const store = await load(STORE_PATH, { autoSave: false });
  const value = JSON.stringify(delegationChain.toJSON());
  await store.set(KEY_STORAGE_DELEGATION, value);
  await store.save();
}

const INITIAL_VALUE: State = {
  client: null,
  delegationChain: null,
  identity: new AnonymousIdentity(),
  isAuthenticated: false,
  ready: false,
};

@Injectable()
export class TauriDeepLinkAuthService implements IAuthService {
  #state = signal(INITIAL_VALUE);
  identity = computed(() => this.#state().identity);
  isAuthenticated = computed(() => this.#state().isAuthenticated);
  principalId = computed(() => this.#state().identity.getPrincipal().toText());
  ready$ = toObservable(this.#state).pipe(map(({ ready }) => ready));
  #destroyRef = inject(DestroyRef);

  constructor() {
    toObservable(this.#state)
      .pipe(
        map(({ delegationChain }) => delegationChain),
        waitDelegationExpired(),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.signOut());
    this.#initState();
    effect(() => console.info(`Principal ID: ${this.principalId()}`));
  }

  async signIn() {
    // AuthClient has generated and saved Ed25519KeyIdentity in the storage
    const identity = (await loadIdentity()) as Ed25519KeyIdentity;
    const publicKey = toHexString(identity.getPublicKey().toDer());
    const url = `${environment.appUrl}/delegation?sessionPublicKey=${publicKey}`;

    // Here we open a browser and continue on the website
    await openUrl(url);
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

  async #initState() {
    const client = await createAuthClient();
    const identity = client.getIdentity();
    const isAuthenticated = await client.isAuthenticated();

    this.#state.update((state) => ({
      ...state,
      client,
      identity,
      isAuthenticated,
      ready: true,
    }));

    const unlistenFn = await onOpenUrl((urls) =>
      this.#parseDelegationFromUrl(urls[0]),
    );
    this.#destroyRef.onDestroy(() => unlistenFn());
  }

  async #parseDelegationFromUrl(url: string) {
    const identity = (await loadIdentity()) as Ed25519KeyIdentity;

    // Get JSON from deep link query param
    const encodedDelegationChain = url.replace(
      `${environment.scheme}://internetIdentityCallback?delegationChain=`,
      '',
    );
    const json: JsonnableDelegationChain = JSON.parse(
      decodeURIComponent(encodedDelegationChain),
    );

    const delegationChain: DelegationChain = DelegationChain.fromJSON(json);

    // Here we create an identity with the delegation chain we received from the website
    const internetIdentity = DelegationIdentity.fromDelegation(
      identity,
      delegationChain,
    );

    this.#state.update((state) => ({
      ...state,
      delegationChain,
      identity: internetIdentity,
      isAuthenticated: true,
    }));

    await saveDelegationChain(delegationChain);
  }
}
