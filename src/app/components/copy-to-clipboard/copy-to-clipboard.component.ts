import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClipboard } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { HlmTooltipTriggerDirective } from '@spartan-ng/ui-tooltip-helm';

@Component({
  selector: 'app-copy-to-clipboard',
  imports: [
    ClipboardModule,
    HlmButtonDirective,
    HlmIconDirective,
    NgIcon,
    HlmTooltipTriggerDirective,
  ],
  template: `
    <button
      class="size-8"
      hlmBtn
      hlmTooltipTrigger="Copy to clipboard"
      size="icon"
      variant="ghost"
      aria-describedby="Copy to clipboard"
      (click)="copy($event)">
      <ng-icon hlm size="sm" name="lucideClipboard" />
    </button>
  `,
  styles: ``,
  providers: [provideIcons({ lucideClipboard })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopyToClipboardComponent {
  content = input.required<string>();
  #clipboard = inject(Clipboard);

  copy(event: MouseEvent) {
    event.stopPropagation();
    this.#clipboard.copy(this.content());
  }
}
