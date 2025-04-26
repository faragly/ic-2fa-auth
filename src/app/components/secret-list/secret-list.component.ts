import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  Signal,
} from '@angular/core';

import { EmptyComponent } from '../empty/empty.component';
import { SecretItemComponent } from '../secret-item/secret-item.component';
import { SecretsService } from '@core/services/secrets.service';
import { Secret } from '@declarations/ic-2fa-auth-backend/ic-2fa-auth-backend.did';

@Component({
  selector: 'app-secret-list',
  imports: [EmptyComponent, SecretItemComponent],
  templateUrl: './secret-list.component.html',
  styleUrl: './secret-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretListComponent {
  filter = input.required<string>();
  #secretsService = inject(SecretsService);
  items: Signal<Secret[]> = computed(() => {
    const data = this.#secretsService.state().data;
    const filter = this.filter();

    return filter
      ? data.filter(({ name }) =>
          name.toLowerCase().includes(filter.toLowerCase()),
        )
      : data;
  });
}
