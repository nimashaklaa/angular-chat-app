import { Routes } from '@angular/router';
import { loginGuard } from './guards/login.guard';

export const routes: Routes = [
    {
        path:'register',
        loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent),
        canActivate: [loginGuard]
    },
    {
        path:'login',
        loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
        canActivate: [loginGuard]
    }
];
