import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDownload, lucideGithub } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';

import { DelegationComponent } from '../delegation/delegation.component';
import { AUTH_SERVICE } from '@core/tokens';

@Component({
  selector: 'app-login',
  imports: [NgIcon, HlmButtonDirective, HlmIconDirective],
  providers: [provideIcons({ lucideGithub, lucideDownload })],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  authService = inject(AUTH_SERVICE);
  #delegationRef = inject(DelegationComponent, {
    optional: true,
  });
  #router = inject(Router);

  constructor() {
    effect(() => {
      if (!this.#delegationRef && this.authService.isAuthenticated()) {
        this.#router.navigate(['/']);
      }
    });
  }
}
