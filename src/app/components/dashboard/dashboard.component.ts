import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideFingerprint,
  lucideGithub,
  lucideMoon,
  lucideSun,
} from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';

import { CreateSecretComponent } from '../create-secret/create-secret.component';
import { SecretListComponent } from '../secret-list/secret-list.component';
import { UserMenuComponent } from '../user-menu/user-menu.component';
import { SecretsService } from '@core/services/secrets.service';
import { environment } from '@environments/environment';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    HlmInputDirective,
    HlmIconDirective,
    NgIcon,
    HlmButtonDirective,
    SecretListComponent,
    UserMenuComponent,
    CreateSecretComponent,
  ],
  providers: [
    provideIcons({ lucideMoon, lucideSun, lucideFingerprint, lucideGithub }),
  ],
  selector: 'app-dashboard',
  styleUrl: './dashboard.component.css',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  readonly appName = environment.appName;
  filter = model('');
  secretsService = inject(SecretsService);
}
