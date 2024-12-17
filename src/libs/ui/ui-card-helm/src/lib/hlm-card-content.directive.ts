import { computed, Directive, input } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const cardContentVariants = cva('p-6 pt-0', {
	variants: {},
	defaultVariants: {},
});
export type CardContentVariants = VariantProps<typeof cardContentVariants>;

@Directive({
	selector: '[hlmCardContent]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmCardContentDirective {
	protected _computedClass = computed(() => hlm(cardContentVariants(), this.userClass()));
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
}
