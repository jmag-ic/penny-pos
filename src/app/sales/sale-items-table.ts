import { Component, inject, Input, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NzTableModule } from "ng-zorro-antd/table";
import { ProductEntity, SaleItemEntity } from "@pos/models";
import { Formatter } from "../shared/formatter";
import { ExpandableComponent } from "../shared/expandable";
import { ApiService } from "../api";

@Component({
  selector: 'pos-sale-items-table',
  standalone: true,
  imports: [CommonModule, NzTableModule],
  template: `
    <nz-table
      #saleItemsTable
      [nzData]="items"
      nzSize="small"
      nzBordered="true"
      [nzShowPagination]="false"
    >
      <thead>
        <tr>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Precio</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        @for(item of saleItemsTable.data; let i = $index; track i) {
          <tr>
            <td>{{ products()[i] ? products()[i].name : item.productId.toString() }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ formatter.currency(item.price) }}</td>
            <td>{{ formatter.currency(item.quantity * item.price) }}</td>
          </tr>
        }
      </tbody>
    </nz-table>
  `,
})
export class SaleItemsTable implements ExpandableComponent<SaleItemEntity> {
  @Input() items: SaleItemEntity[] = [];
  products = signal<ProductEntity[]>([]);
  
  formatter = inject(Formatter);
  api = inject(ApiService);

  ngOnInit(): void {
    this.api.getProductsBulk(this.items.map(item => item.productId)).then(products => {
      this.products.set(products);
    });
  }
} 