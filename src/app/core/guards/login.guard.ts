import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RedirectCommand, Router, RouterStateSnapshot } from '@angular/router';
import { AUTH_SERVICE } from '@core/tokens';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const loginGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AUTH_SERVICE);
  const router = inject(Router);
  if (authService.isAuthenticated()) {
    const dashboardPath = router.parseUrl('/');
    return new RedirectCommand(dashboardPath);
  }
  return true;
};
