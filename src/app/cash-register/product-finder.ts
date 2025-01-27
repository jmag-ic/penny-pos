import { AfterViewInit, Component, ElementRef, inject, OnDestroy, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { ActiveDescendantKeyManager } from "@angular/cdk/a11y";
import { Subscription } from "rxjs";

import { NzButtonModule } from "ng-zorro-antd/button";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzListModule } from "ng-zorro-antd/list";
import { NzSpinModule } from "ng-zorro-antd/spin";

import { ProductItem } from "./product-item";
import { InputCleaner } from "../shared/input-cleaner";
import { InputDebouncer } from "../shared/input-debouncer";

import { CashRegisterStore } from "./store";
import { Product } from "../api/models";

@Component({
  selector: "pos-product-finder",
  imports: [
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzListModule,
    NzSpinModule,
    ProductItem,
    InputCleaner,
    InputDebouncer
  ],
  template: `
    <nz-input-group nzSearch [nzAddOnAfter]="suffixIconButton">
      <input
        #searchInput
        type="text"
        placeholder="Buscar producto..."
        nz-input
        pos-input-debouncer
        pos-input-cleaner
        [value]="store.searchText()"
        (keydown)="handleKeyDownOnSearchInput($event)"
        (textChanged)="store.searchProducts($event)"
      />
    </nz-input-group>
    
    <ng-template #suffixIconButton>
      <button nz-button nzType="primary" nzSearch>
        <span nz-icon nzType="search"></span>
      </button>
    </ng-template>
    
    <nz-list nzBordered nzSize="small">
      @if (store.searching()) {
        <div style="text-align: center; padding: 1rem;">
          <nz-spin nzSimple></nz-spin>
        </div>
      }
      @else {
        @for (product of store.products(); track product.id; let idx = $index) {
          <pos-product-item
            [product]="product"
            (mousemove)="handleMouseMoveOnProductItem(idx)"
            (click)="handleClickOnProductItem(product)"/>
        }
      }
    </nz-list>
  `,
  styles: [`
    :host {
      display: block;
      padding: 1rem;
    }

    nz-input-group {
      margin-bottom: 1rem;
    }

    nz-list {
      overflow-y: scroll;
      height: calc(100vh - 5rem);
    }
  `]
})
export class ProductFinder implements AfterViewInit, OnDestroy {
  // Template references
  @ViewChildren(ProductItem)
  queryListItems!: QueryList<ProductItem>;
  
  @ViewChild('searchInput')
  searchInput!: ElementRef;

  // Inject the cash register store
  protected readonly store = inject(CashRegisterStore);

  // Key manager
  private keyManager!: ActiveDescendantKeyManager<ProductItem>; 
  private queryListSub!: Subscription;

  ngAfterViewInit() {
    // (Re)Initialize key manager on query list change
    this.queryListSub = this.queryListItems.changes.subscribe((listItems: QueryList<ProductItem>) => {
      this.keyManager = new ActiveDescendantKeyManager(listItems).withWrap();
      setTimeout(() => this.keyManager.setFirstItemActive(), 0);
    });
  }

  ngOnDestroy() {
    // Unsubscribe from query list changes
    this.queryListSub.unsubscribe();
  }

  // function to set focus on search input
  focusSearchInput() {
    // Focus the search input if it is not focused
    if (document.activeElement !== this.searchInput.nativeElement) {
      this.searchInput.nativeElement.focus();
    }
  }

  // handleClickOnProductItem method handles click events on product items
  protected handleClickOnProductItem(product: Product) {
    this.focusSearchInput();
    this.store.addLineItem(product);
  }

  // handleKeyDownOnSearchInput method handles keydown events on the search input
  protected handleKeyDownOnSearchInput(event: KeyboardEvent) {
    // Only handle keydown events if the key manager is initialized
    if (!this.keyManager) {
      return;
    }
    
    // Handle Enter key to select the active item
    if (event.code === 'Enter' && this.keyManager.activeItem) {
      this.store.addLineItem(this.keyManager.activeItem.product);
    } else {
      // Delegate other keydown events to the key manager
      this.keyManager.onKeydown(event);
    }
  }

  // handleMouseMoveOnProductItem method handles mousemove events on product items
  protected handleMouseMoveOnProductItem(index: number) {
    this.focusSearchInput();

    // Set the active item on the key manager if it is not already set
    if (this.keyManager && this.keyManager.activeItemIndex !== index) {
      this.keyManager.setActiveItem(index);
    }
  }
}