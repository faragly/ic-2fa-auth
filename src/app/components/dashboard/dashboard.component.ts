import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent, provideIcons } from '@spartan-ng/ui-icon-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { lucideFingerprint, lucideGithub, lucideMoon, lucideSun } from '@ng-icons/lucide';
import { SecretsService } from '@core/services/secrets.service';
import { environment } from '@environments/environment';
import { CreateSecretComponent } from '../create-secret/create-secret.component';
import { SecretListComponent } from '../secret-list/secret-list.component';
import { UserMenuComponent } from '../user-menu/user-menu.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HlmInputDirective,
    HlmIconComponent,
    HlmButtonDirective,
    SecretListComponent,
    UserMenuComponent,
    CreateSecretComponent,
  ],
  providers: [provideIcons({ lucideMoon, lucideSun, lucideFingerprint, lucideGithub })],
  selector: 'app-dashboard',
  styleUrl: './dashboard.component.css',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  readonly appName = environment.appName;
  secretsService = inject(SecretsService);
}
