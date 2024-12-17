import { computed, Directive, input } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import type { ClassValue } from 'clsx';

export const hlmH3 = 'scroll-m-20 text-2xl font-semibold tracking-tight';

@Directive({
	selector: '[hlmH3]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmH3Directive {
	protected _computedClass = computed(() => hlm(hlmH3, this.userClass()));
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
}
