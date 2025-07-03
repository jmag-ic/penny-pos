import { AfterViewInit, Component, ElementRef, inject, OnDestroy, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { ActiveDescendantKeyManager } from "@angular/cdk/a11y";
import { Subscription } from "rxjs";

import { NzButtonModule } from "ng-zorro-antd/button";
import { NzEmptyModule } from "ng-zorro-antd/empty";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzListModule } from "ng-zorro-antd/list";
import { NzSpinModule } from "ng-zorro-antd/spin";

import { ProductEntity } from "@pos/models";

import { ProductItem } from "./product-item";
import { InputCleaner } from "../shared/input-cleaner";
import { InputDebouncer } from "../shared/input-debouncer";

import { CashRegisterStore } from "./cash-register-store";

@Component({
  selector: "pos-product-finder",
  imports: [
    NzButtonModule,
    NzEmptyModule,
    NzIconModule,
    NzInputModule,
    NzListModule,
    NzSpinModule,
    ProductItem,
    InputCleaner,
    InputDebouncer
  ],
  template: `
    <nz-input-group [className]="'mb-3'" nzSearch [nzAddOnAfter]="suffixIconButton">
      <input
        #searchInput
        type="text"
        placeholder="Buscar producto..."
        nz-input
        inputDebouncer
        inputCleaner
        [value]="store.currentSale().searchText"
        (keydown)="handleKeyDownOnSearchInput($event)"
        (textChanged)="store.searchProducts($event)"
      />
    </nz-input-group>
    
    <ng-template #suffixIconButton>
      <button nz-button nzType="primary" nzSearch>
        <span nz-icon nzType="search"></span>
      </button>
    </ng-template>
    
    <nz-list nzBordered nzSize="small" style="background-color: #fff;">
      @if (store.currentSale().searching) {
        <div style="text-align: center; padding: 1rem;">
          <nz-spin nzSimple></nz-spin>
        </div>
      }
      @else if (store.isEmptySearchResult()) {
        <nz-empty [style.padding]="'1rem'" [nzNotFoundContent]="store.emptySearchText()"></nz-empty>
      }
      @else {
        @for (product of store.currentSale().products; track product.id; let idx = $index) {
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
      display: flex !important;
      flex-direction: column !important;
      height: calc(100vh - 8.6rem);
    }

    nz-list {
      flex: 1;
      overflow-y: auto;
    }
  `],
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
  private selectedProductSub!: Subscription;

  ngAfterViewInit() {
    // (Re)Initialize key manager on query list change
    this.initializeKeyManager(this.store.currentSale().selectedProductIdx);
    this.queryListSub = this.queryListItems.changes.subscribe(() => {
      this.initializeKeyManager(this.store.currentSale().selectedProductIdx);
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
  protected handleClickOnProductItem(product: ProductEntity) {
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

  private initializeKeyManager(selectedIdx: number = 0) {
    this.keyManager = new ActiveDescendantKeyManager(this.queryListItems).withWrap();
    this.selectedProductSub?.unsubscribe();
    this.selectedProductSub = this.keyManager.change.subscribe(index => this.store.setSelectedProductIdx(index));
    setTimeout(() => this.keyManager.setActiveItem(selectedIdx), 0);
  }
}