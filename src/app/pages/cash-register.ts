import { Component } from "@angular/core";
import { ProductFinderComponent } from "../components/product-finder";
import { NzGridModule } from "ng-zorro-antd/grid";
import { Product } from "../api/model";

@Component({
    selector: "pos-cash-register",
    imports: [NzGridModule, ProductFinderComponent],
    template: `
      <div nz-row>
        <div nz-col nzSpan="12">
          <pos-product-finder (selectProduct)="onSelectProduct($event)"/>
        </div>
        <div nz-col nzSpan="12">col-12</div>
      </div>
    `
})
export class CashRegisterPage {
  onSelectProduct(product: Product) {
    console.log(product);
  }
}