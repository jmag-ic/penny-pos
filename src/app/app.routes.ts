import { Routes } from '@angular/router';
import { CashRegisterPage } from './pages/cash-register';

export const routes: Routes = [
  {redirectTo: 'cash-register', path: '', pathMatch: 'full'},
  {path: 'cash-register', component: CashRegisterPage},
];
