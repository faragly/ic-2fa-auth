import { InjectionToken, Provider } from '@angular/core';
import { isTauri } from '@tauri-apps/api/core';

import { IAuthService } from '@core/models/auth';
import { AuthService } from '@core/services/auth.service';
import { TauriDeepLinkAuthService } from '@core/services/tauri-deep-link-auth.service';

export const AUTH_SERVICE = new InjectionToken<IAuthService>('AUTH_SERVICE');

export const provideAuthService = (): Provider => ({
  provide: AUTH_SERVICE,
  useClass: isTauri() ? TauriDeepLinkAuthService : AuthService,
});
