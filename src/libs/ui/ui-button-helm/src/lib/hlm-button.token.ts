import { inject, InjectionToken, ValueProvider } from '@angular/core';
import type { ButtonVariants } from './hlm-button.directive';

export interface BrnButtonConfig {
	size: ButtonVariants['size'];
	variant: ButtonVariants['variant'];
}

const defaultConfig: BrnButtonConfig = {
	variant: 'default',
	size: 'default',
};

const BrnButtonConfigToken = new InjectionToken<BrnButtonConfig>('BrnButtonConfig');

export function provideBrnButtonConfig(config: Partial<BrnButtonConfig>): ValueProvider {
	return { provide: BrnButtonConfigToken, useValue: { ...defaultConfig, ...config } };
}

export function injectBrnButtonConfig(): BrnButtonConfig {
	return inject(BrnButtonConfigToken, { optional: true }) ?? defaultConfig;
}
