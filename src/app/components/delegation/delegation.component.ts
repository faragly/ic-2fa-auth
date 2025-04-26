import { ChangeDetectionStrategy, Component } from '@angular/core';
import { fromHexString } from '@dfinity/candid';
import { DelegationChain, Ed25519PublicKey } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';
import { injectQueryParams } from 'ngxtension/inject-query-params';

import { DelegationInternetIdentityTriggerDirective } from '../delegation-internet-identity/delegation-internet-identity-trigger.directive';
import { DelegationInternetIdentityComponent } from '../delegation-internet-identity/delegation-internet-identity.component';
import { LoginComponent } from '../login/login.component';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-delegation',
  imports: [
    DelegationInternetIdentityComponent,
    DelegationInternetIdentityTriggerDirective,
    LoginComponent,
  ],
  templateUrl: './delegation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DelegationComponent {
  publicKey = injectQueryParams<Ed25519PublicKey | null>(
    ({ sessionPublicKey }) =>
      sessionPublicKey
        ? Ed25519PublicKey.fromDer(fromHexString(sessionPublicKey))
        : null,
  );
  readonly targets = [Principal.fromText(environment.backendCanisterId)];

  handleDelegate(delegationChain: DelegationChain) {
    // Send above delegationChainForPublicKey back to Tauri
    const json = JSON.stringify(delegationChain.toJSON());
    window.open(
      `${environment.scheme}://internetIdentityCallback?delegationChain=${encodeURIComponent(json)}`,
    );
  }
}
