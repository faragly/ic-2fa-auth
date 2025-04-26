import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { AuthClient } from '@dfinity/auth-client';
import {
  DelegationChain,
  DelegationIdentity,
  ECDSAKeyIdentity,
  Ed25519PublicKey,
} from '@dfinity/identity';
import { Principal } from '@dfinity/principal';

import { AUTH_MAX_TIME_TO_LIVE } from '@core/constants';
import { AUTH_SERVICE } from '@core/tokens';
import { environment } from '@environments/environment';

function assertPublicKey(
  publicKey: Ed25519PublicKey | null,
): asserts publicKey is Ed25519PublicKey {
  if (!publicKey) throw Error('publicKey not set');
}

// expires in 10 minutes
function getDefaultExpirationDate() {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 10);
  return date;
}

@Component({
  selector: 'app-delegation-internet-identity',
  imports: [],
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DelegationInternetIdentityComponent {
  authService = inject(AUTH_SERVICE);
  delegate = output<DelegationChain>();
  expiration = input<Date>(getDefaultExpirationDate());
  publicKey = input.required<Ed25519PublicKey>();
  targets = input<Principal[]>([]);

  async signInWithDelegation() {
    const publicKey = this.publicKey();

    assertPublicKey(publicKey);

    const middleKeyIdentity = await ECDSAKeyIdentity.generate({
      extractable: false,
      keyUsages: ['sign', 'verify'],
    });
    const client = await AuthClient.create({
      identity: middleKeyIdentity,
      idleOptions: {
        disableDefaultIdleCallback: true,
        disableIdle: true,
      },
      storage: {
        get: () => Promise.resolve(null),
        remove: () => Promise.resolve(),
        set: () => Promise.resolve(),
      },
    });

    await new Promise((resolve, reject) =>
      client.login({
        identityProvider: environment.identityProviderUrl,
        maxTimeToLive: AUTH_MAX_TIME_TO_LIVE,
        onError: reject,
        onSuccess: resolve,
      }),
    );
    const middleIdentity = client.getIdentity() as DelegationIdentity;
    const expiration = this.expiration();

    // Create delegation chain from II delegation chain for public key
    const delegationChainForPublicKey = await DelegationChain.create(
      middleKeyIdentity,
      publicKey,
      expiration,
      {
        previous: middleIdentity.getDelegation(),
        targets: this.targets(),
      },
    );

    this.delegate.emit(delegationChainForPublicKey);
  }
}
