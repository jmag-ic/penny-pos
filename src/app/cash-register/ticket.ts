import { Component, HostBinding, inject, Input } from "@angular/core";
import { DatePipe, DecimalPipe } from "@angular/common";
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzListModule } from "ng-zorro-antd/list";

import { CashRegisterStore } from "./cash-register-store";

@Component({
  selector: "pos-ticket",
  imports: [FormsModule, DatePipe, DecimalPipe, NzButtonModule, NzIconModule, NzInputNumberModule, NzListModule],
  template: `
    <div class="table-container">
      <table class="full-w">
        <tr>
          <th colspan="5">
            Ticket de Venta {{ store.currentSale().id }} : {{ store.currentSale().date | date:'hh:mm:ss a' }}
          </th>
        </tr>
        @for(lineItem of store.currentSale().ticket; track lineItem.product.id) {
          <tr>
            <td>
              <nz-icon class="delete-icon" nzType="delete" nzTheme="outline" (click)="store.removeLineItem(lineItem.product)"/>
            </td>
            <td class="full-w">{{ lineItem.product.name }}</td>
            <td>\${{ lineItem.price | number:'1.2-2' }}</td>
            <td>
              <span style="display: flex; align-items: center;"><span class="mr-1">x</span><nz-input-number [ngModel]="lineItem.quantity" (ngModelChange)="store.updateLineItem(lineItem.product, $event)" /></span>
            </td>
            <td class="border-l">\${{ lineItem.total | number:'1.2-2' }}</td>
          </tr>
        }
      </table>
    </div>
    
    <!-- Total -->
    <div class="total text-lg font-bold p-3">
      <span>Total</span><span>\${{ store.total() | number:'1.2-2' }}</span>
    </div>

    <!-- Checkout -->
    <div class="checkout pt-3">
      <button nz-button [disabled]="store.currentSale().ticket.length === 0" nzType="default" nzSize="large" nzShape="round" (click)="store.resetSale()">Cancelar</button>
      <button nz-button [disabled]="store.currentSale().ticket.length === 0" nzType="primary" nzSize="large" nzShape="round" class="ml-3" (click)="store.setShowCheckoutModal(true)">Agregar pago</button>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 8.6rem);
    }

    .table-container {
      border: 1px solid #ddd;
      overflow-y: auto;
      flex: 1;
      background-color: #fff;
    }

    table {
      border-collapse:collapse;
    }

    thead th {
      position: sticky;
      top: 0;
      background-color: #fafafa;
    }

    th, td {
      padding: 0.35rem 0.45rem;
      border-bottom: 1px solid #ddd;
    }

    td.quantity {
      display: flex;
      align-items: center;
    }

    .delete-icon {
      cursor: pointer;
    }

    .delete-icon:hover {
      color: red;
    }

    .ant-input-number {
      width: 60px;
    }

    .total {
      display: flex;
      justify-content: space-between;
    }

    .checkout {
      display: flex;
      justify-content: end; 
    }
  `],
})
export class Ticket {
  @Input()
  @HostBinding('class') className: string = '';

  protected readonly store = inject(CashRegisterStore);
}