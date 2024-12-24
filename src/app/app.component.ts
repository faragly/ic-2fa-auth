import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmToasterComponent } from '@spartan-ng/ui-sonner-helm';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HlmToasterComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {}
