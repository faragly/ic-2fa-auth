import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmDialogService } from '@spartan-ng/ui-dialog-helm';
import { HlmIconComponent, provideIcons } from '@spartan-ng/ui-icon-helm';
import { lucideLoaderCircle, lucidePlus } from '@ng-icons/lucide';
import { SecretsService } from '@core/services/secrets.service';
import { SecretCreate } from '@declarations/ic-2fa-auth-backend/ic-2fa-auth-backend.did';
import { DialogContext, EditDialogComponent } from '../edit-dialog/edit-dialog.component';

@Component({
  selector: 'app-create-secret',
  imports: [HlmButtonDirective, HlmIconComponent],
  providers: [provideIcons({ lucideLoaderCircle, lucidePlus })],
  templateUrl: './create-secret.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateSecretComponent {
  #destroyRef = inject(DestroyRef);
  #hlmDialogService = inject(HlmDialogService);
  #secretsService = inject(SecretsService);
  loading = computed(() => this.#secretsService.state().loading.create);

  openCreateDialog() {
    const dialogRef = this.#hlmDialogService.open(EditDialogComponent, {
      context: {
        isEdit: false,
        action: (payload: SecretCreate) => this.#secretsService.create(payload),
        messages: {
          loading: 'Creating the secret...',
          success: 'The secret has been successfully created.',
        },
      } satisfies DialogContext,
      contentClass: 'min-w-[400px] sm:max-w-[600px]',
    });

    dialogRef.closed$.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe((result) => {
      if (result) {
        this.#secretsService.refresh();
      }
    });
  }
}
