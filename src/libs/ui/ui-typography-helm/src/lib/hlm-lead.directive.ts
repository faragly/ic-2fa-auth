import { computed, Directive, input } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import type { ClassValue } from 'clsx';

export const hlmLead = 'text-xl text-muted-foreground';

@Directive({
	selector: '[hlmLead]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmLeadDirective {
	protected _computedClass = computed(() => hlm(hlmLead, this.userClass()));
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
}
