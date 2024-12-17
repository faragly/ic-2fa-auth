import { computed, Directive, inject, input, signal } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { BrnLabelDirective } from '@spartan-ng/brain/label';

export const labelVariants = cva(
	'text-sm font-medium leading-none [&>[hlmInput]]:my-1 [&:has([hlmInput]:disabled)]:cursor-not-allowed [&:has([hlmInput]:disabled)]:opacity-70',
	{
		variants: {
			variant: {
				default: '',
			},
			error: {
				auto: '[&:has([hlmInput].ng-invalid.ng-touched)]:text-destructive',
				true: 'text-destructive',
			},
			disabled: {
				auto: '[&:has([hlmInput]:disabled)]:opacity-70',
				true: 'opacity-70',
				false: '',
			},
		},
		defaultVariants: {
			variant: 'default',
			error: 'auto',
		},
	},
);
export type LabelVariants = VariantProps<typeof labelVariants>;

@Directive({
	selector: '[hlmLabel]',
	standalone: true,
	hostDirectives: [
		{
			directive: BrnLabelDirective,
			inputs: ['id'],
		},
	],
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmLabelDirective {
	protected readonly _computedClass = computed(() =>
		hlm(
			labelVariants({
				variant: this.variant(),
				error: this.state().error(),
				disabled: this._brn?.dataDisabled() ?? 'auto',
			}),
			'[&.ng-invalid.ng-touched]:text-destructive',
			this.userClass(),
		),
	);

	protected readonly state = computed(() => ({
		error: signal(this.error()),
	}));

	private readonly _brn = inject(BrnLabelDirective, { host: true });

	public readonly error = input<LabelVariants['error']>('auto');

	public readonly userClass = input<ClassValue>('', { alias: 'class' });

	public readonly variant = input<LabelVariants['variant']>('default');

	setError(error: LabelVariants['error']): void {
		this.state().error.set(error);
	}
}