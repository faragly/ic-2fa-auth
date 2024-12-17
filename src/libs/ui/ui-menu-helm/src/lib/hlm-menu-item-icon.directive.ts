import { computed, Directive, input } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import { provideHlmIconConfig } from '@spartan-ng/ui-icon-helm';
import type { ClassValue } from 'clsx';

@Directive({
	selector: '[hlmMenuIcon]',
	standalone: true,
	providers: [provideHlmIconConfig({ size: 'none' })],
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmMenuItemIconDirective {
	protected _computedClass = computed(() => hlm('mr-2 h-4 w-4', this.userClass()));
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
}
