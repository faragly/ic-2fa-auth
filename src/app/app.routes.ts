import { Routes } from '@angular/router';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { dashboardGuard, loginGuard } from '@core/guards';

export const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [dashboardGuard] },
  {
    path: 'auth',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent,
      ),
    canActivate: [loginGuard],
  },
  {
    path: 'delegation',
    loadComponent: () =>
      import('./components/delegation/delegation.component').then(
        (m) => m.DelegationComponent,
      ),
  },
  { path: '**', pathMatch: 'full', redirectTo: '' },
];
