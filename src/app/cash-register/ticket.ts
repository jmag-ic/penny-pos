import { Component, inject } from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzListModule } from "ng-zorro-antd/list";

import { CashRegisterStore } from "./store";

@Component({
  selector: "pos-ticket",
  imports: [FormsModule, DecimalPipe, NzButtonModule, NzIconModule, NzInputNumberModule, NzListModule],
  template: `
    <div style="flex:1; overflow-y:auto; border:1px solid #ddd;">
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr>
            <th colspan=5 style="text-align:center;">Ticket de venta</th>
          </tr>
        </thead>
        <tbody>
          @if (store.ticket().length === 0) {
            <div style="text-align:center; padding:1rem;">
              <nz-list-empty />
            </div>
          }
          @for(lineItem of store.ticket(); track lineItem.product.id) {
            <tr>
              <td style="width: 100%;">{{ lineItem.product.name }}</td>
              <td class="values">\${{ lineItem.price/100 | number:'1.2-2' }}</td>
              <td class="values" style="display:flex;align-items:center;">
                <span style="margin-right: 0.2rem;">x</span><nz-input-number [ngModel]="lineItem.quantity" (ngModelChange)="store.updateLineItem(lineItem.product, $event)" />
              </td>
              <td class="values">\${{ lineItem.total/100 | number:'1.2-2' }}</td>
              <td class="values">
                <nz-icon style="cursor:pointer;" nzType="delete" nzTheme="outline" (click)="store.removeLineItem(lineItem.product)"/>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    
    <!-- Total -->
    <div style="display:flex; justify-content:space-between; font-size:1.2rem; font-weight:bold; padding:1rem;">
      <span>Total</span><span>\${{ store.total()/100 | number:'1.2-2' }}</span>
    </div>

    <!-- Checkout -->
    <div style="display:flex; justify-content: end; padding-top: 1rem;">
      <button nz-button nzType="default" nzSize="large" nzShape="round">Cancelar</button>
      <button nz-button nzType="primary" nzSize="large" nzShape="round" style="margin-left: 1rem;">Pagar</button>
    </div>
  `,
  styles: [`
    :host {
      height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 1rem;
    }

    th {
      background-color: #fafafa;
    }

    th, td {
      padding: 0.35rem 0.45rem;
      border-bottom: 1px solid #ddd;
    }

    td.values {
      text-align: right;
      border-left: 1px solid #ddd;
    }

    .ant-input-number {
      width: 60px;
    }
  `]
})
export class Ticket {
  protected readonly store = inject(CashRegisterStore);
}