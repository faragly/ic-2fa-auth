import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideLoaderCircle,
  lucidePlus,
  lucideSave,
  lucideTrash,
} from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import {
  HlmDialogDescriptionDirective,
  HlmDialogFooterComponent,
  HlmDialogHeaderComponent,
  HlmDialogTitleDirective,
} from '@spartan-ng/ui-dialog-helm';
import { HlmFormFieldModule } from '@spartan-ng/ui-formfield-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmLabelDirective } from '@spartan-ng/ui-label-helm';
import { HlmSelectImports } from '@spartan-ng/ui-select-helm';
import { toast } from 'ngx-sonner';
import { EMPTY, Observable } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { match, P } from 'ts-pattern';

import {
  ID,
  Secret,
  SecretCreate,
  SecretUpdate,
} from '@declarations/ic-2fa-auth-backend/ic-2fa-auth-backend.did';

export enum OperationType {
  Create,
  Edit,
  Delete,
}

export type DialogContext = {
  closeImmediately?: boolean;
  loading: Signal<boolean>;
  messages: { loading: string; success: string };
  onSuccess?: () => void;
} & (
  | {
      action: (payload: ID) => Observable<null>;
      data: Secret;
      type: OperationType.Delete;
    }
  | {
      action: (payload: SecretCreate) => Observable<null>;
      type: OperationType.Create;
    }
  | {
      action: (payload: SecretUpdate) => Observable<null>;
      data: Secret;
      type: OperationType.Edit;
    }
);

@Component({
  selector: 'app-edit-dialog',
  imports: [
    ReactiveFormsModule,
    HlmDialogHeaderComponent,
    HlmDialogFooterComponent,
    HlmDialogTitleDirective,
    HlmDialogDescriptionDirective,
    HlmLabelDirective,
    HlmInputDirective,
    HlmFormFieldModule,
    HlmButtonDirective,
    HlmIconDirective,
    NgIcon,
    BrnSelectImports,
    HlmSelectImports,
    NgTemplateOutlet,
  ],
  providers: [
    provideIcons({ lucideLoaderCircle, lucidePlus, lucideSave, lucideTrash }),
  ],
  templateUrl: './edit-dialog.component.html',
  styles: `
    @reference 'tailwindcss';
    :host {
      @apply contents;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditDialogComponent {
  dialogContext = injectBrnDialogContext<DialogContext>();
  #fb = inject(FormBuilder);
  form = this.#fb.nonNullable.record({});
  readonly operationType = OperationType;
  readonly otpOptions = [
    { value: 'totp', label: 'TOTP (Time-based OTP)' },
    { value: 'hotp', label: 'HOTP (HMAC-based OTP)', disabled: true },
  ];
  get id() {
    return match(this.dialogContext)
      .with({ data: P.nonNullable.select() }, ({ id }) => id)
      .otherwise(() => null);
  }

  #dialogRef = inject<BrnDialogRef<boolean>>(BrnDialogRef);

  constructor() {
    switch (this.dialogContext.type) {
      case OperationType.Create: {
        this.#registerCreateFormControls();
        break;
      }
      case OperationType.Delete: {
        this.#registerDeleteFormControls(this.dialogContext.data);
        break;
      }
      case OperationType.Edit: {
        this.#registerEditFormControls(this.dialogContext.data);
        break;
      }
    }
  }

  close() {
    this.#dialogRef.close();
  }

  handleSubmit() {
    const action$ = match({
      context: this.dialogContext,
      formValue: this.form.getRawValue(),
    })
      .with(
        {
          context: { type: OperationType.Edit, action: P.select('action') },
          formValue: P.select('payload', {
            id: P.string,
            name: P.string,
            secretKey: P.string,
            otpType: P.union('totp', 'hotp'),
          }),
        },

        ({ action, payload }) =>
          action({
            ...payload,
            otpType: { [payload.otpType]: null } as SecretCreate['otpType'],
          }),
      )
      .with(
        {
          context: { type: OperationType.Create, action: P.select('action') },
          formValue: P.select('payload', {
            name: P.string,
            secretKey: P.string,
            otpType: P.union('totp', 'hotp'),
          }),
        },
        ({ action, payload }) =>
          action({
            ...payload,
            otpType: { [payload.otpType]: null } as SecretCreate['otpType'],
          }),
      )
      .with(
        {
          context: { type: OperationType.Delete, action: P.select('action') },
          formValue: { id: P.string.select('id') },
        },
        ({ action, id }) => action(id),
      )
      .run();
    const toastId = toast.loading(this.dialogContext.messages.loading);

    if (this.dialogContext.closeImmediately) {
      this.#dialogRef.close();
    }

    action$
      .pipe(
        catchError((err) => {
          console.error(err);
          toast.error(err.message, { id: toastId });
          return EMPTY;
        }),
        take(1),
      )
      .subscribe(() => {
        toast.success(this.dialogContext.messages.success, { id: toastId });
        if (this.#dialogRef.state() === 'open') this.#dialogRef.close();
        if (this.dialogContext.onSuccess) this.dialogContext.onSuccess();
      });
  }

  #registerCreateFormControls() {
    this.form.registerControl(
      'name',
      this.#fb.nonNullable.control('', [Validators.required]),
    );
    this.form.registerControl(
      'secretKey',
      this.#fb.nonNullable.control('', [Validators.required]),
    );
    this.form.registerControl(
      'otpType',
      this.#fb.nonNullable.control('totp', [Validators.required]),
    );
  }

  #registerDeleteFormControls(data: Secret) {
    this.form.registerControl(
      'id',
      this.#fb.nonNullable.control(data.id, [Validators.required]),
    );
  }

  #registerEditFormControls(data: Secret) {
    this.form.registerControl(
      'id',
      this.#fb.nonNullable.control(data.id, [Validators.required]),
    );
    this.form.registerControl(
      'name',
      this.#fb.nonNullable.control(data.name, [Validators.required]),
    );
    this.form.registerControl(
      'secretKey',
      this.#fb.nonNullable.control(data.secretKey, [Validators.required]),
    );
    const otpType = Object.keys(data.otpType)[0];
    this.form.registerControl(
      'otpType',
      this.#fb.nonNullable.control(otpType, [Validators.required]),
    );
  }
}
