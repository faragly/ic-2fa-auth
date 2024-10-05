import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AUTH_SERVICE, provideAuthService } from '@core/tokens';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [provideAuthService()]
})
export class AppComponent {
  authService = inject(AUTH_SERVICE);
}
