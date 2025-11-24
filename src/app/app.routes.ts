import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'pos',
    pathMatch: 'full'
  },
  {
    path: 'pos',
    loadComponent: () => import('./pages/pos/pos.component').then(m => m.PosComponent)
  },
  {
    path: 'inventario',
    loadComponent: () => import('./pages/inventario/inventario.component').then(m => m.InventarioComponent)
  },
  {
    path: 'pedidos',
    loadComponent: () => import('./pages/pedidos/pedidos.component').then(m => m.PedidosComponent)
  },
  {
    path: 'cobro',
    loadComponent: () => import('./pages/cobro/cobro.component').then(m => m.CobroComponent)
  },
  {
    path: 'asignacion',
    loadComponent: () => import('./pages/asignacion/asignacion.component').then(m => m.AsignacionComponent)
  },
  {
    path: '**',
    redirectTo: 'pos'
  }
];
