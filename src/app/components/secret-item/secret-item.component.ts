import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import {
  HlmCardContentDirective,
  HlmCardDescriptionDirective,
  HlmCardDirective,
  HlmCardFooterDirective,
  HlmCardHeaderDirective,
  HlmCardTitleDirective,
} from '@spartan-ng/ui-card-helm';
import { HlmDialogService } from '@spartan-ng/ui-dialog-helm';
import { HlmIconComponent, provideIcons } from '@spartan-ng/ui-icon-helm';
import {
  HlmMenuComponent,
  HlmMenuItemDirective,
  HlmMenuItemIconDirective,
  HlmMenuSeparatorComponent,
} from '@spartan-ng/ui-menu-helm';
import { HlmProgressDirective, HlmProgressIndicatorDirective } from '@spartan-ng/ui-progress-helm';
import { HlmMutedDirective } from '@spartan-ng/ui-typography-helm';
import { lucideClipboard, lucideEllipsis, lucidePen, lucideTrash, lucideView } from '@ng-icons/lucide';
import { BrnMenuTriggerDirective } from '@spartan-ng/brain/menu';
import { BrnProgressComponent, BrnProgressIndicatorComponent } from '@spartan-ng/brain/progress';
import { SecretsService } from '@core/services/secrets.service';
import { fromTimestamp } from '@core/utils';
import { Secret as SecretRaw, SecretUpdate } from '@declarations/ic-2fa-auth-backend/ic-2fa-auth-backend.did';
import { CopyToClipboardComponent } from '../copy-to-clipboard/copy-to-clipboard.component';
import { DialogContext, EditDialogComponent } from '../edit-dialog/edit-dialog.component';

interface Secret {
  createdAt: Date;
  id: string;
  name: string;
  otpType: 'hotp' | 'totp';
  secretKey: string;
  updatedAt: Date;
}

@Component({
  selector: 'app-secret-item',
  imports: [
    HlmButtonDirective,
    HlmCardContentDirective,
    HlmCardDescriptionDirective,
    HlmCardDirective,
    HlmCardFooterDirective,
    HlmCardHeaderDirective,
    HlmCardTitleDirective,
    HlmIconComponent,
    BrnProgressComponent,
    BrnProgressIndicatorComponent,
    HlmProgressDirective,
    HlmProgressIndicatorDirective,
    HlmMutedDirective,
    HlmMenuComponent,
    HlmMenuItemDirective,
    HlmMenuSeparatorComponent,
    HlmMenuItemIconDirective,
    BrnMenuTriggerDirective,
    CopyToClipboardComponent,
  ],
  templateUrl: './secret-item.component.html',
  styles: `
    :host {
      @apply max-w-[400px];
    }
  `,
  providers: [provideIcons({ lucideClipboard, lucideEllipsis, lucidePen, lucideTrash, lucideView })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretItemComponent {
  #destroyRef = inject(DestroyRef);
  #hlmDialogService = inject(HlmDialogService);
  #secretsService = inject(SecretsService);
  data = computed(() => {
    const data = this.dataRaw();
    return {
      ...data,
      otpType: Object.keys(data.otpType)[0] as Secret['otpType'],
      createdAt: fromTimestamp(data.createdAt),
      updatedAt: fromTimestamp(data.updatedAt),
    } satisfies Secret;
  });
  dataRaw = input.required<SecretRaw>();

  openEditDialog() {
    const dialogRef = this.#hlmDialogService.open(EditDialogComponent, {
      context: {
        isEdit: true,
        action: (payload: SecretUpdate) => this.#secretsService.update(payload),
        messages: {
          loading: 'Updating the secret...',
          success: 'The secret has been successfully updated.',
        },
        data: this.dataRaw(),
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
