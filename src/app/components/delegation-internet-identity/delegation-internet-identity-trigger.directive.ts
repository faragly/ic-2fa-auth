import { Directive, inject } from '@angular/core';

import { DelegationInternetIdentityComponent } from './delegation-internet-identity.component';

@Directive({
  selector: '[appDelegationInternetIdentityTrigger]',
  standalone: true,
  host: {
    '(click)': 'component.signInWithDelegation()',
  },
})
export class DelegationInternetIdentityTriggerDirective {
  component = inject(DelegationInternetIdentityComponent);
}
