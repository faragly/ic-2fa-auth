import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  linkedSignal,
  OnInit,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import {
  HlmDialogComponent,
  HlmDialogContentComponent,
  HlmDialogFooterComponent,
  HlmDialogHeaderComponent,
  HlmDialogTitleDirective,
} from '@spartan-ng/ui-dialog-helm';
import { HlmFormFieldModule } from '@spartan-ng/ui-formfield-helm';
import { HlmIconComponent, provideIcons } from '@spartan-ng/ui-icon-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmLabelDirective } from '@spartan-ng/ui-label-helm';
import { HlmSelectImports } from '@spartan-ng/ui-select-helm';
import { asyncScheduler, EMPTY } from 'rxjs';
import { catchError, observeOn, switchMap, take } from 'rxjs/operators';
import { lucideLoaderCircle, lucidePlus } from '@ng-icons/lucide';
import { BrnDialogComponent, BrnDialogContentDirective } from '@spartan-ng/brain/dialog';
import { BrnSelectComponent, BrnSelectImports } from '@spartan-ng/brain/select';
import { toast } from 'ngx-sonner';
import { SecretsService } from '@core/services/secrets.service';
import { SecretCreate } from '@declarations/ic-2fa-auth-backend/ic-2fa-auth-backend.did';

@Component({
  selector: 'app-create-secret',
  imports: [
    ReactiveFormsModule,
    BrnDialogContentDirective,
    HlmDialogComponent,
    HlmDialogContentComponent,
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
  providers: [provideIcons({ lucideLoaderCircle, lucidePlus })],
  templateUrl: './create-secret.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateSecretComponent implements OnInit {
  #destroyRef = inject(DestroyRef);
  #fb = inject(FormBuilder);
  #secretsService = inject(SecretsService);
  dialog = viewChild.required(BrnDialogComponent);
  form = this.#fb.nonNullable.group({
    name: ['', Validators.required],
    secretKey: ['', Validators.required],
    otpType: ['totp', Validators.required],
  });
  loading = computed(() => this.#secretsService.state().loading.create);
  readonly otpOptions = [
    { value: 'totp', label: 'TOTP (Time-based OTP)' },
    { value: 'hotp', label: 'HOTP (HMAC-based OTP)', disabled: true },
  ];
  select = viewChild(BrnSelectComponent);
  state = linkedSignal(
    toSignal(toObservable(this.dialog).pipe(switchMap((dialog) => dialog.stateChanged.asObservable())), {
      initialValue: 'closed',
    }),
  );

  handleSubmit() {
    const { name, otpType, secretKey } = this.form.getRawValue();
    const toastId = toast.loading('Creating the secret...');
    this.#secretsService
      .create({
        name,
        secretKey,
        otpType: { [otpType]: null } as SecretCreate['otpType'],
      })
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
        toast.success('The secret has been successfully created.', { id: toastId });
        this.#secretsService.refresh();
        this.state.set('closed');
      });
  }

  ngOnInit(): void {
    // workaround for select initial value
    this.dialog()
      .stateChanged.asObservable()
      .pipe(observeOn(asyncScheduler), takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => {
        this.select()?.writeValue(this.form.value.otpType);
      });
  }
}
