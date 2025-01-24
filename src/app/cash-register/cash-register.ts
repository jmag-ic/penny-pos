import { Component, signal } from "@angular/core";

import { NzGridModule } from "ng-zorro-antd/grid";
import { NzTableModule } from 'ng-zorro-antd/table';

import { ProductFinder } from "./product-finder";
import { Product } from "../api/model";

@Component({
  selector: "pos-cash-register",
  imports: [NzGridModule, NzTableModule, ProductFinder],
  template: `
    <div nz-row>
      <div nz-col nzSpan="12">
        <pos-product-finder (productSelected)="onProductSelected($event)"/>
      </div>
      <div nz-col nzSpan="12">
        <ul>
        @for (item of items(); track item.product.id) {
          <li>
            <span>{{ item.product.name }}</span>
            <span>{{ item.quantity }}</span>
            <span>{{ item.price }}</span>
            <span>{{ item.total }}</span>
            <button (click)="deleteProduct(item.product)">Eliminar</button>
          </li>
        }
        </ul>
      </div>
    </div>
  `
})
export class CashRegister {

  items = signal<ProductItem[]>([]);

  onProductSelected(product: Product) {
    const item = this.items().find((item) => item.product.id === product.id);
    if (item) {
      this.updateItem(product);
    } else {
      this.addProduct(product);
    }
  }

  addProduct(product: Product) {
    this.items.update((items) => {
      const item = {
        product,
        quantity: 1,
        price: product.price,
        total: product.price
      };
      return [...items, item];
    });
  }

  updateItem(product: Product) {
    this.items.update((items) =>
      items.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      )
    );
  }

  deleteProduct(product: Product) {
    this.items.update((items) => items.filter((item) => item.product.id !== product.id));
  }
}

interface ProductItem {
  product: Product
  quantity: number
  price: number
  total: number
}