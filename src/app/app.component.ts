
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { RouterOutlet, RouterModule } from '@angular/router';

import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';

import { map } from 'rxjs';
import { AppStore } from './app.store';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterModule, RouterOutlet, NzAvatarModule, NzBreadCrumbModule, NzIconModule, NzLayoutModule, NzMenuModule],
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
          <div class="top-bar mt-3">
            <nz-breadcrumb [nzAutoGenerate]="true" />
            <nz-avatar nzText="U" />
          </div>

          <!-- Router outlet -->
          <router-outlet />
        </div>
      </nz-content>
    </nz-layout>

  </nz-layout>`,
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
    background: #fff;
  }
  
  .top-bar {
    display: flex;
    justify-content: space-between;
  }
  
  nz-avatar{
    color: #f56a00;
    background-color: #fde3cf;
  }`]
})
export class AppComponent {
  
  protected readonly store = inject(AppStore)
  private readonly breakPointObsserver = inject(BreakpointObserver)

  constructor() {
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
