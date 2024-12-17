import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DelegationChain, DelegationIdentity, ECDSAKeyIdentity } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';
import { HlmIconComponent, provideIcons } from '@spartan-ng/ui-icon-helm';
import { injectQueryParams } from 'ngxtension/inject-query-params';
import { lucideDownload, lucideGithub, lucideLogOut } from '@ng-icons/lucide';
import { Buffer } from 'buffer';
import { AUTH_MAX_TIME_TO_LIVE, IDENTITY_PROVIDER_DEFAULT } from '@core/constants';
import { AUTH_SERVICE } from '@core/tokens';
import { createAuthClient } from '@core/utils';
import { environment } from '@environments/environment';

function getExpirationDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7); // 7 days
  return date;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HlmIconComponent],
  providers: [provideIcons({ lucideGithub, lucideDownload, lucideLogOut })],
  selector: 'app-auth',
  styleUrl: './auth.component.css',
  templateUrl: './auth.component.html',
})
export class AuthComponent {
  #router = inject(Router);
  authService = inject(AUTH_SERVICE);
  sessionPublicKey = injectQueryParams('sessionPublicKey');

  constructor() {
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.#router.navigate(['/']);
      }
    });
  }

  signIn() {
    const sessionPublicKey = this.sessionPublicKey();

    if (sessionPublicKey) {
      this.signInWithDelegation(sessionPublicKey);
    } else {
      this.authService.signIn();
    }
  }

  async signInWithDelegation(sessionPublicKey: string) {
    const delegationIdentity = await ECDSAKeyIdentity.generate({
      extractable: false,
      keyUsages: ['sign', 'verify'],
    });
    const client = await createAuthClient(delegationIdentity);
    const identityUrl =
      environment.production && import.meta.env.DFX_NETWORK === 'ic'
        ? IDENTITY_PROVIDER_DEFAULT
        : `http://${import.meta.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943/`;
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
      { toDer: () => Buffer.from(sessionPublicKey) },
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
