import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';

import { AUTH_SERVICE } from '@core/tokens';

export const dashboardGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AUTH_SERVICE);
  return authService.ready$.pipe(
    filter((v) => v),
    map(() => {
      const isAuthenticated = authService.isAuthenticated();
      if (!isAuthenticated) {
        const loginPath = router.parseUrl('/auth');
        return new RedirectCommand(loginPath, { skipLocationChange: true });
      }

      return true;
    }),
  );
};
