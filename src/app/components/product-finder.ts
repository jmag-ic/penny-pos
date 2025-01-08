import { AfterViewInit, Component, ElementRef, OnDestroy, output, QueryList, signal, ViewChild, ViewChildren } from "@angular/core";
import { ActiveDescendantKeyManager } from "@angular/cdk/a11y";
import { Subscription } from "rxjs";

import { NzButtonModule } from "ng-zorro-antd/button";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzListModule } from "ng-zorro-antd/list";
import { NzSpinModule } from "ng-zorro-antd/spin";

import { ProductItemComponent } from "./product-item";
import { InputCleanerDirective } from "../directives/input-cleaner";
import { InputDebouncerDirective } from "../directives/input-debouncer";

import { ElectronApi } from "../api/electron.api";
import { Product } from "../api/model";

@Component({
  selector: "pos-product-finder",
  imports: [
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzListModule,
    NzSpinModule,
    ProductItemComponent,
    InputCleanerDirective,
    InputDebouncerDirective
  ],
  template: `
    <nz-input-group nzSearch [nzAddOnAfter]="suffixIconButton">
      <input
        #searchInput
        type="text"
        placeholder="Buscar producto..."
        nz-input
        posInputDebouncer
        posInputCleaner
        (keydown)="onInputSearchKeyDown($event)"
        (textChange)="onInputSearchTextChange($event)"
      />
    </nz-input-group>
    
    <ng-template #suffixIconButton>
      <button nz-button nzType="primary" nzSearch>
        <span nz-icon nzType="search"></span>
      </button>
    </ng-template>
    
    <nz-list nzBordered nzSize="small">
      @if (searching()) {
        <div style="text-align: center; padding: 1rem;">
          <nz-spin nzSimple></nz-spin>
        </div>
      }
      @else {
        @for (product of products(); track product.id; let itemIndex = $index) {
          <pos-product-item
            [item]="product"
            [highligthWords]="searchWords()"
            (mousemove)="onItemMouseMove(itemIndex)"
            (click)="onItemClick(product)" />
        }
        @if (products().length === 0) {
          <nz-list-empty />
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
export class ProductFinderComponent implements AfterViewInit, OnDestroy {

  // Template references
  @ViewChildren(ProductItemComponent)
  queryListItems!: QueryList<ProductItemComponent>;
  
  @ViewChild('searchInput')
  inputSearch!: ElementRef;

  // Outputs
  readonly selectProduct = output<Product>();

  // Component state (signals)
  readonly searchWords = signal<string[]>([]);
  readonly products = signal<Product[]>([]);
  readonly searching = signal<boolean>(false);

  // Key manager
  private keyManager!: ActiveDescendantKeyManager<ProductItemComponent>; 
  private queryListSub!: Subscription;

  constructor(private api: ElectronApi) {}

  ngAfterViewInit() {
    // Initialize key manager on query list items change
    this.queryListSub = this.queryListItems.changes.subscribe((listItems: QueryList<ProductItemComponent>) => {
      this.keyManager = new ActiveDescendantKeyManager(listItems).withWrap();
      setTimeout(()=>this.keyManager.setFirstItemActive(), 0);
    });
  }

  ngOnDestroy() {
    // Unsubscribe from query list changes
    this.queryListSub.unsubscribe();
  }

  // onInputSearchKeyDown method handles keydown events on the search input
  onInputSearchKeyDown(event: KeyboardEvent) {
    if (this.keyManager) {
      if (event.code === 'Enter' && this.keyManager.activeItem) {
        this._selectProduct(this.keyManager.activeItem.item);
      } else {
        this.keyManager.onKeydown(event);
      }
    }
  }

  // onInputSearchTextChange method handles text changes(emitted by input debouncer directive) on the search input
  onInputSearchTextChange(text: string) {
    if (!text) {
      if (this.products().length > 0) {
        this.products.set([]);
      }
      return;
    }

    // Update searching and search words state
    this.searching.set(true);
    this.searchWords.set(text.split(' ').map(word => word.trim()));

    // Fetch products from the database
    this.api.getProducts(text).subscribe({
      next: (products: Product[]) => {
        this.products.set(products);
      },
      complete: () => {
        this.searching.set(false);
      },
      error: (error: Error) => {
        console.error(error);
        this.searching.set(false);
      }
    });
  }

  // onItemClick method handles click events on product items
  onItemClick(item: Product) {
    this._selectProduct(item);
  }

  // onItemMouseMove method handles mousemove events on product items
  onItemMouseMove(index: number) {
    // Focus the search input if it is not focused
    if (document.activeElement !== this.inputSearch.nativeElement) {
      this.inputSearch.nativeElement.focus();
    }

    // Set the active item on the key manager if it is not already set
    if (this.keyManager && this.keyManager.activeItemIndex !== index) {
      this.keyManager.setActiveItem(index);
    }
  }

  // _selectProduct method emits the selectProduct event and resets the component state
  private _selectProduct(item: Product) {
    this.selectProduct.emit(item);
    this.products.set([]);
    this.inputSearch.nativeElement.value = '';
  }
}