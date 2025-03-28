import { Routes } from '@angular/router';

import { InConstruction } from './shared/in-construction';

import { CashRegister } from './cash-register';
import { Inventory } from './inventory/inventory';

export const routes: Routes = [
  {redirectTo: 'cash-register', path: '', pathMatch: 'full'},
  {
    path: 'home',
    component: InConstruction,
    data: {
      breadcrumb: 'Inicio'
    }
  }, {
    path: 'cash-register',
    component: CashRegister,
    data: {
      breadcrumb: 'Registrar Ventas'
    }
  }, {
    path: 'inventory',
    component: Inventory,
    data: {
      breadcrumb: 'Inventario'
    }
  }, {
    path: 'sales',
    component: InConstruction,
    data: {
      breadcrumb: 'Ventas'
    }
  }, {
    path: 'orders',
    component: InConstruction,
    data: {
      breadcrumb: 'Pedidos'
    }
  }, {
    path: 'users',
    component: InConstruction,
    data: {
      breadcrumb: 'Ususarios'
    }
  }, {
    path: 'settings',
    component: InConstruction,
    data: {
      breadcrumb: 'Configuración'
    }
  },
];
