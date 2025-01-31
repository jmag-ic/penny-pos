import { Component, HostBinding, inject, Input } from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzListModule } from "ng-zorro-antd/list";

import { SalesStore } from "./store";

@Component({
  selector: "pos-ticket",
  imports: [FormsModule, DecimalPipe, NzButtonModule, NzIconModule, NzInputNumberModule, NzListModule],
  template: `
    <div class="table-container">
      <table class="full-w">
        <thead>
          <tr>
            <th colspan=5 class="text-center">Ticket de venta {{ store.currentSale().id }}</th>
          </tr>
        </thead>
        <tbody>
          @if(store.currentSale().ticket.length === 0){
            <nz-list-empty />
          }
          @for(lineItem of store.currentSale().ticket; track lineItem.product.id) {
            <tr>
              <td>
                <nz-icon class="delete-icon" nzType="delete" nzTheme="outline" (click)="store.removeLineItem(lineItem.product)"/>
              </td>
              <td class="full-w">{{ lineItem.product.name }}</td>
              <td>\${{ lineItem.price/100 | number:'1.2-2' }}</td>
              <td class="quantity">
                <!-- <div class="quantity"> -->
                  <span class="mr-1">x</span><nz-input-number [ngModel]="lineItem.quantity" (ngModelChange)="store.updateLineItem(lineItem.product, $event)" />
                <!-- </div> -->
              </td>
              <td class="border-l">\${{ lineItem.total/100 | number:'1.2-2' }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    
    <!-- Total -->
    <div class="total p-3">
      <span>Total</span><span>\${{ store.total()/100 | number:'1.2-2' }}</span>
    </div>

    <!-- Checkout -->
    <div class="checkout pt-3">
      <button nz-button nzType="default" nzSize="large" nzShape="round">Cancelar</button>
      <button nz-button nzType="primary" nzSize="large" nzShape="round" class="ml-3">Pagar</button>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 8rem);
    }

    .table-container {
      border: 1px solid #ddd;
      overflow-y: auto;
      flex: 1;
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
      font-size: 1.2rem;
      font-weight: bold;
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

  protected readonly store = inject(SalesStore);
}