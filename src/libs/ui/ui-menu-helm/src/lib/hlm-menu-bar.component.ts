import { Component, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import type { ClassValue } from 'clsx';
import { BrnMenuBarDirective } from '@spartan-ng/brain/menu';

@Component({
	selector: 'hlm-menu-bar',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
	hostDirectives: [BrnMenuBarDirective],
	template: '<ng-content/>',
})
export class HlmMenuBarComponent {
	protected _computedClass = computed(() =>
		hlm('border-border flex h-10 items-center space-x-1 rounded-md border bg-background p-1', this.userClass()),
	);
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
}
