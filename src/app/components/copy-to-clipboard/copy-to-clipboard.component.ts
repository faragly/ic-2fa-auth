import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent, provideIcons } from '@spartan-ng/ui-icon-helm';
import { HlmTooltipTriggerDirective } from '@spartan-ng/ui-tooltip-helm';
import { lucideClipboard } from '@ng-icons/lucide';

@Component({
  selector: 'app-copy-to-clipboard',
  imports: [ClipboardModule, HlmButtonDirective, HlmIconComponent, HlmTooltipTriggerDirective],
  template: `
    <button
      class="size-8"
      hlmBtn
      hlmTooltipTrigger="Copy to clipboard"
      size="icon"
      variant="ghost"
      aria-describedby="Copy to clipboard"
      (click)="copy($event)">
      <hlm-icon size="sm" name="lucideClipboard" />
    </button>
  `,
  styles: ``,
  providers: [provideIcons({ lucideClipboard })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopyToClipboardComponent {
  #clipboard = inject(Clipboard);
  content = input.required<string>();

  copy(event: MouseEvent) {
    event.stopPropagation();
    this.#clipboard.copy(this.content());
  }
}
