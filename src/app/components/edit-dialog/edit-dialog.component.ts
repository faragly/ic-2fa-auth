import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import {
  HlmDialogFooterComponent,
  HlmDialogHeaderComponent,
  HlmDialogTitleDirective,
} from '@spartan-ng/ui-dialog-helm';
import { HlmFormFieldModule } from '@spartan-ng/ui-formfield-helm';
import { HlmIconComponent, provideIcons } from '@spartan-ng/ui-icon-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmLabelDirective } from '@spartan-ng/ui-label-helm';
import { HlmSelectImports } from '@spartan-ng/ui-select-helm';
import { asyncScheduler, EMPTY, Observable } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { lucideLoaderCircle, lucidePlus, lucideSave } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { BrnSelectComponent, BrnSelectImports } from '@spartan-ng/brain/select';
import { toast } from 'ngx-sonner';
import { match, P } from 'ts-pattern';
import { SecretsService } from '@core/services/secrets.service';
import { Secret, SecretCreate, SecretUpdate } from '@declarations/ic-2fa-auth-backend/ic-2fa-auth-backend.did';

export type DialogContext = {
  messages: { loading: string; success: string };
} & ( // eslint-disable-next-line no-unused-vars
  | { action: (payload: SecretCreate) => Observable<null>; isEdit: false }
  // eslint-disable-next-line no-unused-vars
  | { action: (payload: SecretUpdate) => Observable<null>; data: Secret; isEdit: true }
);

@Component({
  selector: 'app-edit-dialog',
  imports: [
    ReactiveFormsModule,
    HlmDialogHeaderComponent,
    HlmDialogFooterComponent,
    HlmDialogTitleDirective,
    HlmLabelDirective,
    HlmInputDirective,
    HlmFormFieldModule,
    HlmButtonDirective,
    HlmIconComponent,
    BrnSelectImports,
    HlmSelectImports,
    NgTemplateOutlet,
  ],
  providers: [provideIcons({ lucideLoaderCircle, lucidePlus, lucideSave })],
  templateUrl: './edit-dialog.component.html',
  styles: `
    :host {
      @apply contents;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditDialogComponent implements OnInit {
  #destroyRef = inject(DestroyRef);
  #dialogContext = injectBrnDialogContext<DialogContext>();
  #dialogRef = inject<BrnDialogRef<boolean>>(BrnDialogRef);
  #fb = inject(FormBuilder);
  #secretsService = inject(SecretsService);
  form = this.#fb.nonNullable.group({
    name: ['', Validators.required],
    secretKey: ['', Validators.required],
    otpType: ['totp', Validators.required],
  });
  isEdit = this.#dialogContext.isEdit;
  loading = computed(() => {
    const loadingState = this.#secretsService.state().loading;
    return match(this.#dialogContext)
      .with({ isEdit: true, data: P.select() }, ({ id }) => loadingState.update.includes(id))
      .otherwise(() => loadingState.create);
  });
  readonly otpOptions = [
    { value: 'totp', label: 'TOTP (Time-based OTP)' },
    { value: 'hotp', label: 'HOTP (HMAC-based OTP)', disabled: true },
  ];
  select = viewChild.required(BrnSelectComponent);

  close() {
    this.#dialogRef.close();
  }

  handleSubmit() {
    const { name, otpType: otpTypeRaw, secretKey } = this.form.getRawValue();
    const otpType = { [otpTypeRaw]: null } as SecretCreate['otpType'];
    const action$ = match(this.#dialogContext)
      .with({ isEdit: true, data: P.select('item'), action: P.select('action') }, ({ item: { id }, action }) =>
        action({
          id,
          name,
          secretKey,
          otpType,
        }),
      )
      .with({ isEdit: false, action: P.select() }, (action) =>
        action({
          name,
          secretKey,
          otpType,
        }),
      )
      .exhaustive();
    const toastId = toast.loading(this.#dialogContext.messages.loading);
    action$
      .pipe(
        catchError((err) => {
          console.error(err);
          toast.error(err.message, { id: toastId });
          return EMPTY;
        }),
        take(1),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe(() => {
        toast.success(this.#dialogContext.messages.success, { id: toastId });
        this.#dialogRef.close(true);
      });
  }

  ngOnInit(): void {
    asyncScheduler.schedule(() =>
      match(this.#dialogContext)
        .with({ isEdit: true, data: P.select() }, ({ name, secretKey, otpType }) => {
          this.form.patchValue({ name, secretKey, otpType: Object.keys(otpType)[0] });
        })
        // workaround for select initial value
        .otherwise(() => this.select().writeValue(this.form.value.otpType)),
    );
  }
}
