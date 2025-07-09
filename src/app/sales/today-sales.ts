import { Component, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { SalesStore } from './sales-store';
import { CurrencyPipe } from '@angular/common';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { datePlusDays } from '@pos/utils/dates';
import { Router } from '@angular/router';

@Component({
  selector: 'pos-today-sales',
  imports: [NzIconModule, NzButtonModule, CurrencyPipe, NzTagModule],
  template: `
    <button nz-button nzType="link" (click)="onButtonClick()">
      <span>Vendido hoy:</span><nz-tag style="margin-left: 4px;" nzSize="large" nzColor="green">{{ store.todaySalesAmount() | currency }}</nz-tag>
    </button>
  `
})
export class TodaySales {
  store = inject(SalesStore);
  router = inject(Router);
  onButtonClick() {
    // Set the date range to today
    const today = new Date();
    this.store.setDateRange([today, today]);
    this.router.navigate(['/sales']);
  }
}