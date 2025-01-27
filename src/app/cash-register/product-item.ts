import { Component, ElementRef, inject, Input, ViewChild } from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { Highlightable } from "@angular/cdk/a11y";

import { NzListModule } from "ng-zorro-antd/list";
import { NzTagModule } from "ng-zorro-antd/tag";
import { NzIconModule } from "ng-zorro-antd/icon";

import { HighlightWordsPipe } from "../shared/highlight-words-pipe";
import { Product } from "../api/models";
import { CashRegisterStore } from "./store";

@Component({
  imports: [NzIconModule, NzListModule, NzTagModule, DecimalPipe, HighlightWordsPipe],
  selector: 'pos-product-item',
  template: `
    <div #containerRef>
    <nz-list-item [class.disabled]="disabled" [class.active]="isActive">
      <span [innerHTML]="product.name | highlightText: store.searchWords()"></span>
      <div class="stats">
        <nz-tag class="price" nzColor="green">
          <div class="tag-content">
            <span nz-icon nzType="dollar"></span>
            <span>{{ product.price/100 | number:'1.2-2' }}</span>
          </div>
        </nz-tag>
        <nz-tag class="stock" [nzColor]="getStockColor(product.stock)">
          <div class="tag-content">
            <span nz-icon nzType="stock"></span>
            <span>{{ product.stock !== null ? product.stock : '∞' }}</span>
          </div>
        </nz-tag>
      </div>
      </nz-list-item>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      border-bottom: 1px solid #f0f0f0;
    }

    :host:last-child {
      border-bottom: none;
    }

    div.tag-content {
      display: flex;
      justify-content: space-between;
    }

    div.stats {
      display: flex;
      flex-direction: column;
    }
  
    nz-tag.price {
      min-width: 5rem;
    }
  
    nz-tag.stock {
      min-width: 3.5rem;
    }
  
    [nzType="dollar-o"] {
      color: #52c41a;
    }

    .active  {
      background-color: #1890ff;
      color: #fff;
    }
    
    .disabled {
      opacity: 0.4;
    }
  `]
})
export class ProductItem implements Highlightable {
  // Inputs
  @Input() product!: Product;
  @Input() disabled?: boolean | undefined;

  // Template references
  @ViewChild('containerRef') containerRef!: ElementRef;

  // Inject the cash register store
  protected store = inject(CashRegisterStore);

  // Component state
  private _isActive: boolean = false;

  // Getters
  get isActive() {
    return this._isActive;
  }

  // setActiveStyles and setInactiveStyles are implemented from the Highlightable interface
  // They are used to set the active and inactive styles of the product item
  setActiveStyles() {
    this._isActive = true;
    this.scrollIntoView();
  }

  setInactiveStyles() {
    this._isActive = false;
  }

  // getLabel is implemented from the Highlightable interface
  getLabel() {
    return this.product.name;
  }

  protected getStockColor(stock: number | null): string {
    return stock !== null ? (stock > 10 ? 'blue' : (stock > 0 ? 'gold' : 'red')) : 'default';
  }

  // scrollIntoView is a helper method to scroll the product item into
  private scrollIntoView(): void {
    this.containerRef.nativeElement.scrollIntoView({ block: 'nearest' });
  }
}