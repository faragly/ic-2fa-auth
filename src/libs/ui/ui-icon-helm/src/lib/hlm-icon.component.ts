import { isPlatformBrowser } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	ElementRef,
	inject,
	input,
	type OnDestroy,
	PLATFORM_ID,
	signal,
	ViewEncapsulation,
} from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { type IconType, NgIconComponent } from '@ng-icons/core';
import { injectHlmIconConfig } from './hlm-icon.token';

const DEFINED_SIZES = ['xs', 'sm', 'base', 'lg', 'xl', 'none'] as const;

type DefinedSizes = (typeof DEFINED_SIZES)[number];

export const iconVariants = cva('inline-flex', {
	variants: {
		variant: {
			xs: 'h-3 w-3',
			sm: 'h-4 w-4',
			base: 'h-6 w-6',
			lg: 'h-8 w-8',
			xl: 'h-12 w-12',
			none: '',
		} satisfies Record<DefinedSizes, string>,
	},
	defaultVariants: {
		variant: 'base',
	},
});

export type IconVariants = VariantProps<typeof iconVariants>;

export type IconSize = DefinedSizes | (Record<never, never> & string);

const isDefinedSize = (size: IconSize): size is DefinedSizes => {
	return DEFINED_SIZES.includes(size as DefinedSizes);
};

const TAILWIND_H_W_PATTERN = /\b(h-\d+|w-\d+)\b/g;

@Component({
	selector: 'hlm-icon',
	standalone: true,
	imports: [NgIconComponent],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<ng-icon
			[class]="ngIconClass()"
			[size]="ngIconSize()"
			[name]="name()"
			[color]="color()"
			[strokeWidth]="strokeWidth()"
		/>
	`,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmIconComponent implements OnDestroy {
	protected readonly _computedClass = computed(() => {
		const size: IconSize = this.size();
		const hostClasses = this._hostClasses();
		const variant = isDefinedSize(size) ? size : 'none';
		const classes = variant === 'none' && size === 'none' ? hostClasses : hostClasses.replace(TAILWIND_H_W_PATTERN, '');
		return hlm(iconVariants({ variant }), this.userClass(), classes);
	});
	protected readonly ngIconSize = computed(() => (isDefinedSize(this.size()) ? '100%' : (this.size() as string)));
	private readonly _config = injectHlmIconConfig();

	private readonly _host = inject(ElementRef);

	private readonly _hostClasses = signal<string>('');

	private _mutObs?: MutationObserver;

	private readonly _platformId = inject(PLATFORM_ID);

	public readonly color = input<string | undefined>(undefined);

	public readonly name = input<IconType>(this._config.name);

	public readonly ngIconClass = input<ClassValue>('');

	public readonly size = input<IconSize>(this._config.size);

	public readonly strokeWidth = input<number | string | undefined>(undefined);

	public readonly userClass = input<ClassValue>('', { alias: 'class' });

	constructor() {
		if (isPlatformBrowser(this._platformId)) {
			this._mutObs = new MutationObserver((mutations: MutationRecord[]) => {
				mutations.forEach((mutation: MutationRecord) => {
					if (mutation.attributeName !== 'class') return;
					this._hostClasses.set((mutation.target as { className?: string } & Node)?.className ?? '');
				});
			});
			this._mutObs.observe(this._host.nativeElement, {
				attributes: true,
			});
		}
	}

	ngOnDestroy() {
		this._mutObs?.disconnect();
		this._mutObs = undefined;
	}
}
