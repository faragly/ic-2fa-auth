import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent, provideIcons } from '@spartan-ng/ui-icon-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { invoke } from '@tauri-apps/api/core';
import { lucideFingerprint, lucideGithub, lucideMoon, lucidePlus, lucideSun } from '@ng-icons/lucide';
import { environment } from '@environments/environment';
import { SecretListComponent } from '../secret-list/secret-list.component';
import { UserMenuComponent } from '../user-menu/user-menu.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HlmInputDirective, HlmIconComponent, HlmButtonDirective, SecretListComponent, UserMenuComponent],
  providers: [provideIcons({ lucideMoon, lucideSun, lucideFingerprint, lucideGithub, lucidePlus })],
  selector: 'app-dashboard',
  styleUrl: './dashboard.component.css',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  readonly appName = environment.appName;
  greetingMessage = '';

  greet(event: SubmitEvent, name: string): void {
    event.preventDefault();

    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    invoke<string>('greet', { name }).then((text) => {
      this.greetingMessage = text;
    });
  }
}
