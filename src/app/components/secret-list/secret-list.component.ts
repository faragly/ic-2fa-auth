import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { Secret } from '@core/models/secrets';
import { EmptyComponent } from '../empty/empty.component';
import { SecretItemComponent } from '../secret-item/secret-item.component';

@Component({
  selector: 'app-secret-list',
  imports: [EmptyComponent, SecretItemComponent],
  templateUrl: './secret-list.component.html',
  styleUrl: './secret-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretListComponent {
  items: WritableSignal<Secret[]> = signal([]);
}
