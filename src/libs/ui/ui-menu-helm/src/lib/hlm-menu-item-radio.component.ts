import { Component, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import { HlmIconComponent, provideIcons } from '@spartan-ng/ui-icon-helm';
import type { ClassValue } from 'clsx';
import { lucideCircle } from '@ng-icons/lucide';

@Component({
	selector: 'hlm-menu-item-radio',
	standalone: true,
	providers: [provideIcons({ lucideCircle })],
	imports: [HlmIconComponent],
	template: `
		<!-- Using 0.5rem for size to mimick h-2 w-2 -->
		<hlm-icon size="0.5rem" class="*:*:fill-current" name="lucideCircle" />
	`,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmMenuItemRadioComponent {
	protected _computedClass = computed(() =>
		hlm(
			'group-[.checked]:opacity-100 opacity-0 absolute left-2 flex h-3.5 w-3.5 items-center justify-center',
			this.userClass(),
		),
	);
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
}