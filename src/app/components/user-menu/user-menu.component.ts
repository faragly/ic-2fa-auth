import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HlmAvatarComponent, HlmAvatarImageDirective } from '@spartan-ng/ui-avatar-helm';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent, provideIcons } from '@spartan-ng/ui-icon-helm';
import { HlmPopoverContentDirective } from '@spartan-ng/ui-popover-helm';
import { HlmSeparatorDirective } from '@spartan-ng/ui-separator-helm';
import { lucideLogOut } from '@ng-icons/lucide';
import {
  BrnPopoverCloseDirective,
  BrnPopoverComponent,
  BrnPopoverContentDirective,
  BrnPopoverTriggerDirective,
} from '@spartan-ng/brain/popover';
import { BrnSeparatorComponent } from '@spartan-ng/brain/separator';
import { AUTH_SERVICE } from '@core/tokens';
import { CopyToClipboardComponent } from '../copy-to-clipboard/copy-to-clipboard.component';

@Component({
  selector: 'app-user-menu',
  imports: [
    BrnPopoverComponent,
    BrnPopoverTriggerDirective,
    BrnPopoverContentDirective,
    BrnPopoverCloseDirective,
    HlmPopoverContentDirective,
    HlmAvatarImageDirective,
    HlmAvatarComponent,
    HlmButtonDirective,
    HlmSeparatorDirective,
    BrnSeparatorComponent,
    CopyToClipboardComponent,
    HlmIconComponent,
  ],
  template: `
    <brn-popover sideOffset="5" closeDelay="100" align="end">
      <button brnPopoverTrigger class="cursor-default">
        <hlm-avatar class="border-gray-800 bg-gray-100">
          <img src="avatar-placeholder.svg" alt="avatar placeholder" hlmAvatarImage />
        </hlm-avatar>
      </button>
      <div hlmPopoverContent class="grid w-80 p-1" *brnPopoverContent="let ctx">
        <div class="overflow-hidden px-3 pt-3">
          <h4 class="font-medium leading-none">Principal ID</h4>
          @let principalId = authService.principalId();
          <div class="flex items-center gap-2">
            <p class="truncate font-mono text-sm text-muted-foreground">{{ principalId }}</p>
            <app-copy-to-clipboard [content]="principalId" />
          </div>
        </div>
        <brn-separator hlmSeparator class="my-1" />
        <button
          class="w-full"
          hlmBtn
          variant="ghost"
          aria-describedby="Sign out"
          brnPopoverClose
          (click)="authService.signOut()">
          <hlm-icon size="sm" name="lucideLogOut" class="mr-2" />
          Sign out
        </button>
      </div>
    </brn-popover>
  `,
  providers: [provideIcons({ lucideLogOut })],
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMenuComponent {
  #router = inject(Router);
  authService = inject(AUTH_SERVICE);

  constructor() {
    effect(() => {
      if (!this.authService.isAuthenticated()) {
        this.#router.navigate(['/auth']);
      }
    });
  }
}
