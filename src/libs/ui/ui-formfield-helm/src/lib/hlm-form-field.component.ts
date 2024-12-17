import { Component, computed, contentChild, contentChildren, effect } from '@angular/core';
import { BrnFormFieldControl } from '@spartan-ng/brain/form-field';
import { HlmErrorDirective } from './hlm-error.directive';

@Component({
	selector: 'hlm-form-field',
	template: `
		<ng-content />

		@switch (hasDisplayedMessage()) {
			@case ('error') {
				<ng-content select="hlm-error" />
			}
			@default {
				<ng-content select="hlm-hint" />
			}
		}
	`,
	standalone: true,
	host: {
		class: 'space-y-2 block',
	},
})
export class HlmFormFieldComponent {
	protected readonly hasDisplayedMessage = computed<'error' | 'hint'>(() =>
		this.errorChildren() && this.errorChildren().length > 0 && this.control()?.errorState() ? 'error' : 'hint',
	);

	public readonly control = contentChild(BrnFormFieldControl);

	public readonly errorChildren = contentChildren(HlmErrorDirective);

	constructor() {
		effect(() => {
			if (!this.control()) {
				throw new Error('hlm-form-field must contain a BrnFormFieldControl.');
			}
		});
	}
}
