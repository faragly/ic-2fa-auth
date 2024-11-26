import { Routes } from '@angular/router';
import { dashboardGuard, loginGuard } from '@core/guards';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [dashboardGuard] },
  {
    path: 'auth',
    loadComponent: () => import('./components/auth/auth.component').then((m) => m.AuthComponent),
    canActivate: [loginGuard],
  },
  { path: '**', pathMatch: 'full', redirectTo: '' },
];
