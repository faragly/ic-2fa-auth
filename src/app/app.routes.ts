import { Routes } from "@angular/router";
import { AuthComponent } from "./components/auth/auth.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";

export const routes: Routes = [
    { path: '', component: DashboardComponent },
    { path: 'auth-delegation', loadComponent: () => import("./components/auth/auth.component").then(m => m.AuthComponent) },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];
