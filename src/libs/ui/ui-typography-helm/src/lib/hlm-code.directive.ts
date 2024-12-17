import { computed, Directive, input } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import type { ClassValue } from 'clsx';

export const hlmCode = 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold';

@Directive({
	selector: '[hlmCode]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmCodeDirective {
	protected _computedClass = computed(() => hlm(hlmCode, this.userClass()));
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
}
