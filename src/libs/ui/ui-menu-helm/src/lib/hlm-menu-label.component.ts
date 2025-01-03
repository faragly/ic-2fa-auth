import { booleanAttribute, Component, computed, Input, input, signal } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import type { ClassValue } from 'clsx';

@Component({
	selector: 'hlm-menu-label',
	standalone: true,
	template: `
		<ng-content />
	`,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmMenuLabelComponent {
	protected _computedClass = computed(() =>
		hlm('block px-2 py-1.5 text-sm font-semibold', this._inset() && 'pl-8', this.userClass()),
	);
	private readonly _inset = signal<ClassValue>(false);

	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	@Input({ transform: booleanAttribute })
	public set inset(value: boolean) {
		this._inset.set(value);
	}
}
