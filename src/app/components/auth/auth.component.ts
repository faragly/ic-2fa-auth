import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DelegationChain, DelegationIdentity, ECDSAKeyIdentity } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';
import { injectQueryParams } from 'ngxtension/inject-query-params';
import { Buffer } from 'buffer';
import { AUTH_MAX_TIME_TO_LIVE, IDENTITY_PROVIDER_DEFAULT } from '@core/constants';
import { AUTH_SERVICE } from '@core/tokens';
import { createAuthClient } from '@core/utils';
import { environment } from '@environments/environment';

function assertPublicKey(publicKey: string | null): asserts publicKey is string {
  if (!publicKey) throw Error('The publicKey not provided');
}

function getExpirationDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7); // 7 days
  return date;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-auth',
  standalone: true,
  styleUrl: './auth.component.scss',
  templateUrl: './auth.component.html',
})
export class AuthComponent implements OnInit {
  authService = inject(AUTH_SERVICE);
  publicKey = injectQueryParams('publicKey');

  ngOnInit(): void {
    const publicKey = this.publicKey();
    assertPublicKey(publicKey);
    this.signIn(publicKey);
  }

  async signIn(publicKey: string) {
    const delegationIdentity = await ECDSAKeyIdentity.generate({
      extractable: false,
      keyUsages: ['sign', 'verify'],
    });
    const client = await createAuthClient(delegationIdentity);
    const identityUrl =
      environment.production && import.meta.env.DFX_NETWORK === 'ic'
        ? IDENTITY_PROVIDER_DEFAULT
        : `http://${import.meta.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:8080/`;
    const delegationChain = await new Promise<DelegationChain>((resolve, reject) =>
      client.login({
        identityProvider: identityUrl,
        maxTimeToLive: AUTH_MAX_TIME_TO_LIVE,
        onError: reject,
        onSuccess: () => resolve((client.getIdentity() as DelegationIdentity).getDelegation()),
      }),
    );
    // Create delegation chain from II delegation chain for public key
    const delegationChainForPublicKey = await DelegationChain.create(
      delegationIdentity,
      { toDer: () => Buffer.from(publicKey) },
      getExpirationDate(),
      {
        previous: delegationChain,
        targets: [Principal.fromText(import.meta.env.CANISTER_ID_IC_2FA_AUTH_BACKEND)],
      },
    );
    // Send above delegationChainForPublicKey back to Tauri
    const json = JSON.stringify(delegationChainForPublicKey.toJSON());
    window.open(`${environment.scheme}://internetIdentityCallback?delegationChain=${encodeURIComponent(json)}`);
  }
}
