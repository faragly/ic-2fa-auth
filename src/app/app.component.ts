import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { HlmIconComponent, provideIcons } from '@spartan-ng/ui-icon-helm';
// import { lucideDownload, lucideGithub } from '@ng-icons/lucide';
// import { AUTH_SERVICE, provideAuthService } from '@core/tokens';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  // providers: [provideAuthService(), provideIcons({ lucideGithub, lucideDownload })],
  selector: 'app-root',
  standalone: true,
  styleUrl: './app.component.scss',
  templateUrl: './app.component.html',
})
export class AppComponent {
  // authService = inject(AUTH_SERVICE);
}
