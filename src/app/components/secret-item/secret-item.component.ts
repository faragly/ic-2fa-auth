import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideClipboard,
  lucideEllipsis,
  lucidePen,
  lucideTrash,
  lucideView,
} from '@ng-icons/lucide';
import { BrnMenuTriggerDirective } from '@spartan-ng/brain/menu';
import {
  BrnProgressComponent,
  BrnProgressIndicatorComponent,
} from '@spartan-ng/brain/progress';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import {
  HlmCardContentDirective,
  HlmCardDirective,
  HlmCardFooterDirective,
  HlmCardHeaderDirective,
  HlmCardTitleDirective,
} from '@spartan-ng/ui-card-helm';
import { HlmDialogService } from '@spartan-ng/ui-dialog-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import {
  HlmMenuComponent,
  HlmMenuItemDirective,
  HlmMenuItemIconDirective,
} from '@spartan-ng/ui-menu-helm';
import {
  HlmProgressDirective,
  HlmProgressIndicatorDirective,
} from '@spartan-ng/ui-progress-helm';
import { HlmMutedDirective } from '@spartan-ng/ui-typography-helm';
import { defer, of, timer } from 'rxjs';
import {
  connect,
  ignoreElements,
  mergeWith,
  repeat,
  switchMap,
} from 'rxjs/operators';
import { TOTP } from 'totp-generator';

import { CopyToClipboardComponent } from '../copy-to-clipboard/copy-to-clipboard.component';
import {
  DialogContext,
  EditDialogComponent,
  OperationType,
} from '../edit-dialog/edit-dialog.component';
import { SecretsService } from '@core/services/secrets.service';
import { fromTimestamp } from '@core/utils';
import {
  ID,
  Secret as SecretRaw,
  SecretUpdate,
} from '@declarations/ic-2fa-auth-backend/ic-2fa-auth-backend.did';

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
    HlmCardDirective,
    HlmCardFooterDirective,
    HlmCardHeaderDirective,
    HlmCardTitleDirective,
    NgIcon,
    HlmIconDirective,
    BrnProgressComponent,
    BrnProgressIndicatorComponent,
    HlmProgressDirective,
    HlmProgressIndicatorDirective,
    HlmMutedDirective,
    HlmMenuComponent,
    HlmMenuItemDirective,
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
  providers: [
    provideIcons({
      lucideClipboard,
      lucideEllipsis,
      lucidePen,
      lucideTrash,
      lucideView,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretItemComponent {
  dataRaw = input.required<SecretRaw>();
  data = computed(() => {
    const data = this.dataRaw();
    return {
      ...data,
      otpType: Object.keys(data.otpType)[0] as Secret['otpType'],
      createdAt: fromTimestamp(data.createdAt),
      updatedAt: fromTimestamp(data.updatedAt),
    } satisfies Secret;
  });
  token = toSignal(
    toObservable(this.data).pipe(
      switchMap(({ secretKey }) =>
        defer(() => of(TOTP.generate(secretKey))).pipe(
          connect((shared) =>
            shared.pipe(
              mergeWith(
                shared.pipe(
                  switchMap(({ expires }) => timer(new Date(expires))),
                  ignoreElements(),
                ),
              ),
            ),
          ),
          repeat(),
        ),
      ),
    ),
  );
  otp = computed(() => this.token()?.otp);
  #secretsService = inject(SecretsService);
  seconds = computed(() => {
    const now = this.#secretsService.state().now;
    const token = this.token() as NonNullable<ReturnType<typeof this.token>>;
    return Math.min(Math.max(Math.round((token.expires - now) / 1000), 0), 30);
  });
  progress = computed(() => Math.round((this.seconds() / 30) * 100));
  #hlmDialogService = inject(HlmDialogService);

  openDeleteDialog() {
    const data = this.dataRaw();
    this.#hlmDialogService.open(EditDialogComponent, {
      context: {
        action: (payload: ID) => this.#secretsService.delete(payload),
        closeImmediately: true,
        loading: computed(() =>
          this.#secretsService.state().loading.delete.includes(data.id),
        ),
        messages: {
          loading: 'Deleting the secret...',
          success: 'The secret has been successfully deleted.',
        },
        data,
        type: OperationType.Delete,
        onSuccess: () => this.#secretsService.refresh(),
      } satisfies DialogContext,
      contentClass: 'min-w-[400px] sm:max-w-[600px]',
    });
  }

  openEditDialog() {
    const data = this.dataRaw();
    this.#hlmDialogService.open(EditDialogComponent, {
      context: {
        action: (payload: SecretUpdate) => this.#secretsService.update(payload),
        loading: computed(() =>
          this.#secretsService.state().loading.update.includes(data.id),
        ),
        messages: {
          loading: 'Updating the secret...',
          success: 'The secret has been successfully updated.',
        },
        data,
        type: OperationType.Edit,
        onSuccess: () => this.#secretsService.refresh(),
      } satisfies DialogContext,
      contentClass: 'min-w-[400px] sm:max-w-[600px]',
    });
  }
}
