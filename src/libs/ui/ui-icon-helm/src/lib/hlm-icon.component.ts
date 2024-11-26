import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Input,
  type OnDestroy,
  PLATFORM_ID,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import { cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { type IconName, NgIconComponent } from '@ng-icons/core';

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
      [class]="ngIconCls()"
      [size]="ngIconSize()"
      [name]="_name()"
      [color]="_color()"
      [strokeWidth]="_strokeWidth()" />
  `,
  host: {
    '[class]': '_computedClass()',
  },
})
export class HlmIconComponent implements OnDestroy {
  protected readonly _color = signal<string | undefined>(undefined);
  protected readonly _computedClass = computed(() => {
    const size: IconSize = this._size();
    const hostClasses = this._hostClasses();
    const userCls = this.userCls();
    const variant = isDefinedSize(size) ? size : 'none';
    const classes = variant === 'none' && size === 'none' ? hostClasses : hostClasses.replace(TAILWIND_H_W_PATTERN, '');
    return hlm(iconVariants({ variant }), userCls, classes);
  });

  protected readonly _name = signal<IconName | string>('');

  protected readonly _size = signal<IconSize>('base');

  protected readonly _strokeWidth = signal<number | string | undefined>(undefined);
  protected readonly ngIconCls = signal<ClassValue>('');
  protected readonly ngIconSize = computed(() => (isDefinedSize(this._size()) ? '100%' : (this._size() as string)));
  protected readonly userCls = signal<ClassValue>('');
  private readonly _host = inject(ElementRef);
  private readonly _hostClasses = signal<string>('');
  private _mutObs?: MutationObserver;

  private readonly _platformId = inject(PLATFORM_ID);

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

  @Input()
  set class(cls: ClassValue) {
    this.userCls.set(cls);
  }

  @Input()
  set color(value: string | undefined) {
    this._color.set(value);
  }

  @Input()
  set name(value: IconName | string) {
    this._name.set(value);
  }

  @Input()
  set ngIconClass(cls: ClassValue) {
    this.ngIconCls.set(cls);
  }

  @Input()
  set size(value: IconSize) {
    this._size.set(value);
  }

  @Input()
  set strokeWidth(value: number | string | undefined) {
    this._strokeWidth.set(value);
  }
}
