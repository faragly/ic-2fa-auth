import { Component, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import type { ClassValue } from 'clsx';

@Component({
	selector: 'hlm-menu-shortcut',
	standalone: true,
	template: `
		<ng-content />
	`,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmMenuShortcutComponent {
	protected _computedClass = computed(() =>
		hlm('ml-auto font-light text-xs tracking-widest opacity-60', this.userClass()),
	);
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
}
