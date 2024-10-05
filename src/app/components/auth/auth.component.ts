import { Component, effect, inject, OnInit } from '@angular/core';
import {
  AUTH_MAX_TIME_TO_LIVE,
  IDENTITY_PROVIDER_DEFAULT,
} from '@core/constants';
import { AUTH_SERVICE } from '@core/tokens';
import { createAuthClient } from '@core/utils';
import {
  DelegationChain,
  DelegationIdentity,
  ECDSAKeyIdentity,
} from '@dfinity/identity';
import { environment } from '@environments/environment';
import { injectQueryParams } from 'ngxtension/inject-query-params';
import { Buffer } from 'buffer';
import { Principal } from '@dfinity/principal';

function assertPublicKey(
  publicKey: string | null
): asserts publicKey is string {
  if (!publicKey) throw Error('The publicKey not provided');
}

function getExpirationDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7); // 7 days
  return date;
};

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
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
    const identityUrl = environment.production
      ? IDENTITY_PROVIDER_DEFAULT
      : `http://${
          import.meta.env.CANISTER_ID_INTERNET_IDENTITY
        }.localhost:8080/`;
    const delegationChain = await new Promise<DelegationChain>(
      (resolve, reject) =>
        client.login({
          identityProvider: identityUrl,
          maxTimeToLive: AUTH_MAX_TIME_TO_LIVE,
          onSuccess: () =>
            resolve(
              (client.getIdentity() as DelegationIdentity).getDelegation()
            ),
          onError: reject,
        })
    );
    // Create delegation chain from II delegation chain for public key
    const delegationChainForPublicKey = await DelegationChain.create(
      delegationIdentity,
      { toDer: () => Buffer.from(publicKey) },
      getExpirationDate(),
      {
        previous: delegationChain,
        targets: [
          Principal.fromText(import.meta.env.CANISTER_ID_IC_2FA_AUTH_BACKEND),
        ],
      }
    );
    // Send above delegationChainForPublicKey back to Tauri
    const json = JSON.stringify(delegationChainForPublicKey.toJSON());
    window.open(
      `${
        environment.scheme
      }://internetIdentityCallback?delegationChain=${encodeURIComponent(json)}`
    );
  }
}
