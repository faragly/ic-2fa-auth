import { computed, Directive, inject, input } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import type { ClassValue } from 'clsx';
import { BrnAvatarImageDirective } from '@spartan-ng/brain/avatar';

@Directive({
	selector: 'img[hlmAvatarImage]',
	standalone: true,
	exportAs: 'avatarImage',
	hostDirectives: [BrnAvatarImageDirective],
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmAvatarImageDirective {
	protected _computedClass = computed(() => hlm('aspect-square object-cover h-full w-full', this.userClass()));

	public canShow = inject(BrnAvatarImageDirective).canShow;
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
}
