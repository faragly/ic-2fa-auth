import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import {
  HlmCardContentDirective,
  HlmCardDescriptionDirective,
  HlmCardDirective,
  HlmCardFooterDirective,
  HlmCardHeaderDirective,
  HlmCardTitleDirective,
} from '@spartan-ng/ui-card-helm';
import { HlmIconComponent, provideIcons } from '@spartan-ng/ui-icon-helm';
import {
  HlmMenuComponent,
  HlmMenuItemDirective,
  HlmMenuItemIconDirective,
  HlmMenuSeparatorComponent,
} from '@spartan-ng/ui-menu-helm';
import { HlmProgressDirective, HlmProgressIndicatorDirective } from '@spartan-ng/ui-progress-helm';
import { HlmMutedDirective } from '@spartan-ng/ui-typography-helm';
import { lucideClipboard, lucideEllipsis, lucidePen, lucideTrash, lucideView } from '@ng-icons/lucide';
import { BrnMenuTriggerDirective } from '@spartan-ng/brain/menu';
import { BrnProgressComponent, BrnProgressIndicatorComponent } from '@spartan-ng/brain/progress';
import { Secret } from '@core/models/secrets';
import { CopyToClipboardComponent } from '../copy-to-clipboard/copy-to-clipboard.component';

@Component({
  selector: 'app-secret-item',
  imports: [
    HlmButtonDirective,
    HlmCardContentDirective,
    HlmCardDescriptionDirective,
    HlmCardDirective,
    HlmCardFooterDirective,
    HlmCardHeaderDirective,
    HlmCardTitleDirective,
    HlmIconComponent,
    BrnProgressComponent,
    BrnProgressIndicatorComponent,
    HlmProgressDirective,
    HlmProgressIndicatorDirective,
    HlmMutedDirective,
    HlmMenuComponent,
    HlmMenuItemDirective,
    HlmMenuSeparatorComponent,
    HlmMenuItemIconDirective,
    BrnMenuTriggerDirective,
    CopyToClipboardComponent,
  ],
  templateUrl: './secret-item.component.html',
  styles: `
    :host {
      @apply max-w-[400px];
    }
  `,
  providers: [provideIcons({ lucideClipboard, lucideEllipsis, lucidePen, lucideTrash, lucideView })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretItemComponent {
  data = input.required<Secret>();
}