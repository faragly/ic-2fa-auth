import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  {
    path: 'auth-delegation',
    loadComponent: () => import('./components/auth/auth.component').then((m) => m.AuthComponent),
  },
  { path: '**', pathMatch: 'full', redirectTo: '' },
];
