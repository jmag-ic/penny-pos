import { Routes } from '@angular/router';
import { CashRegister } from './cash-register';

export const routes: Routes = [
  {redirectTo: 'cash-register', path: '', pathMatch: 'full'},
  {path: 'cash-register', component: CashRegister},
];
