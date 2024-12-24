import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { SecretsService } from '@core/services/secrets.service';
import { Secret } from '@declarations/ic-2fa-auth-backend/ic-2fa-auth-backend.did';
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
  #secretsService = inject(SecretsService);
  items: Signal<Secret[]> = computed(() => this.#secretsService.state().data);
}
