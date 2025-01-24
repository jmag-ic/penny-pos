import { Component, inject } from "@angular/core";

import { NzGridModule } from "ng-zorro-antd/grid";
import { NzTableModule } from 'ng-zorro-antd/table';

import { ProductFinder } from "./product-finder";
import { CashRegisterStore } from "./store";

@Component({
  selector: "pos-cash-register",
  imports: [NzGridModule, NzTableModule, ProductFinder],
  template: `
    <div nz-row>
      <div nz-col nzSpan="12">
        <pos-product-finder/>
      </div>
      <div nz-col nzSpan="12">
        <ul>
        @for (item of store.ticket(); track item.product.id) {
          <li>
            <span>{{ item.product.name }}</span>
            <span>{{ item.quantity }}</span>
            <span>{{ item.price }}</span>
            <span>{{ item.total }}</span>
            <button (click)="store.removeTicketItem(item.product)">Remove</button>
          </li>
        }
        </ul>
        <div>
          <span>Total: {{ store.total() }}</span>
        </div>
      </div>
    </div>
  `
})
export class CashRegister {
  // Inject the cash register store
  protected readonly store = inject(CashRegisterStore);
}