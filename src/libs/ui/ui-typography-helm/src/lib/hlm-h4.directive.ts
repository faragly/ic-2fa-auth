import { computed, Directive, input } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import type { ClassValue } from 'clsx';

export const hlmH4 = 'scroll-m-20 text-xl font-semibold tracking-tight';

@Directive({
	selector: '[hlmH4]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmH4Directive {
	protected _computedClass = computed(() => hlm(hlmH4, this.userClass()));
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
}
