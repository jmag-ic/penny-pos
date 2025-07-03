
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { RouterOutlet, RouterModule } from '@angular/router';

import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';

import { DisplayMode, ValdemortConfig, ValdemortModule } from 'ngx-valdemort';

import { map } from 'rxjs';
import { AppStore } from './app.store';
import { TodaySales } from "./sales/today-sales";

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    NzAvatarModule,
    NzBreadCrumbModule,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
    ValdemortModule,
    TodaySales
],
  template: `
  <nz-layout>
    <nz-sider
      nzCollapsible
      [nzCollapsed]="store.collapsedMenu()"
      (nzCollapsedChange)="store.setCollapsedMenu($event)"
    >
      <!-- Only shows logo if sidebar is extended -->
      @if(!store.collapsedMenu()) {
        <div class="logo">
          <img src="logo.png" width="100%" />
        </div>
      }

      <!-- Menu component -->
      <ul nz-menu nzTheme="dark" nzMode="inline">
        @for(entry of menu; let idx = $index; track idx) {
          @if(entry.items){
            <li nz-submenu nzTitle=entry.title [nzIcon]=entry.icon>
              <ul>
                @for(item of entry.items; let idx = $index; track idx){
                  <li nz-menu-item [nzMatchRouter]="true">{{ item.title }}</li>
                }
              </ul>
            </li>
          } @else {
            <li nz-menu-item [nzMatchRouter]="true" [routerLink]="[entry.link]">
              <nz-icon [nzType]="entry.icon"/>
              <span>{{ entry.title }}</span>
            </li>
          }
        }
      </ul>
    </nz-sider>

    <nz-layout>
      <nz-content>
        <div class="inner-content p-3">
          <!-- Top bar -->
          <div class="top-bar mb-3">
            <nz-breadcrumb [nzAutoGenerate]="true" />
            <div class="nav-actions">
              <pos-today-sales />
              <nz-avatar nzText="U" />
            </div>
          </div>

          <!-- Router outlet -->
          <router-outlet />
        </div>
      </nz-content>
    </nz-layout>

  </nz-layout>
  
  <val-default-errors>
    <ng-template valError="required" let-label>{{ label || 'Campo' }} requerido</ng-template>
    <ng-template valError="email" let-label>E-mail inválido</ng-template>
    <ng-template valError="min" let-error="error" let-label>
      {{ label || 'El valor' }} debe ser al menos {{ error.min | number }}
    </ng-template>
    <ng-template valError="max" let-error="error" let-label>
      {{ label || 'El valor' }} debe ser como máximo {{ error.max | number }}
    </ng-template>
    <ng-template valError="minlength" let-error="error" let-label>
      {{ label || 'El valor' }} debe tener al menos {{ error.minlength | number }} caracteres
    </ng-template>
    <ng-template valError="maxlength" let-error="error" let-label>
      {{ label || 'El valor' }} debe tener como máximo {{ error.maxlength | number }} caracteres
    </ng-template>
  </val-default-errors>`,
  styles: [`
  .logo {
    height: 70px;
    background: rgba(255, 255, 255, 0.2);
    margin: 16px;
  }

  nz-layout {
    height: 100vh;
  }

  .inner-content {
    height: 100vh;
    background:rgb(244, 244, 244);
  }
  
  .top-bar {
    display: flex;
    justify-content: space-between;
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  nz-avatar{
    color: #f56a00;
    background-color: #fde3cf;
  }`]
})
export class AppComponent {
  
  protected readonly store = inject(AppStore)
  private readonly breakPointObsserver = inject(BreakpointObserver)

  constructor(config: ValdemortConfig) {
    config.errorsClasses = 'invalid-feedback';
    config.displayMode = DisplayMode.ONE;
    config.shouldDisplayErrors = (control, _) => control.dirty || control.touched;

    const isCollapsed$ = this.breakPointObsserver.observe([`(max-width: 1024px)`]).pipe(
      map(result => result.matches)
    );

    this.store.setCollapsedMenu(isCollapsed$);
  }

  menu: Array<MenuEntry> = [{
    title: 'Inicio',
    icon: 'home',
    link: '/home'
  }, {
    title: 'Registrar Ventas',
    icon: 'shopping',
    link: '/cash-register'
  }, {
    title: 'Inventario',
    icon: 'database',
    link: '/inventory'
  }, {
    title: 'Ventas',
    icon: 'dollar',
    link: '/sales'
  }, {
    title: 'Pedidos',
    icon: 'truck',
    link: '/orders'
  }, {
    title: 'Usuarios',
    icon: 'team',
    link: '/users'
  }, {
    title: 'Configuración',
    icon: 'setting',
    link: '/settings'
  }];
}

interface MenuEntry {
  title: string
  icon: string
  link?: string
  items?: MenuEntry[]
}
