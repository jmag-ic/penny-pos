import { Component, HostListener, inject, OnInit, ViewChild, ElementRef, computed, InjectionToken } from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { Validators } from "@angular/forms";

import { NzButtonModule } from "ng-zorro-antd/button";
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzInputModule } from "ng-zorro-antd/input";

import { Product } from "@pos/models";

import { CtrlCommander } from "../shared/ctrl-commander";
import { Formatter } from "../shared/formatter";
import { InputCleaner } from "../shared/input-cleaner";
import { InputDebouncer } from "../shared/input-debouncer";
import { PosCrudModalForm } from "../shared/crud-modal-form";
import { PosCrudTable, Column } from "../shared/crud-table";

import { InventoryStore } from "./inventory-store";
import { CRUD_TABLE_STORE } from "../shared/with-crud-table";

@Component({
  selector: 'pos-inventory',
  imports: [
    PosCrudTable,
    PosCrudModalForm,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzDropDownModule,
    InputCleaner,
    InputDebouncer
  ],
  template: `
    <div style="display: flex; justify-content: space-between;" class="mb-3">
      <nz-button-group>
        <button nz-button nzType="primary" (click)="onNewProduct()">
          <nz-icon nzType="tag" />
          Nuevo
        </button>
        <button nz-button nzType="default" disabled>
          <nz-icon nzType="import" />
          Importar
        </button>
      </nz-button-group>
      <div style="display: flex; justify-content: space-between; width: 50%;">
      <nz-input-group nzSearch [nzAddOnAfter]="suffixIconButton">
        <input
          #searchInput
          type="text"
          placeholder="Buscar producto..."
          nz-input
          pos-input-debouncer
          pos-input-cleaner
          [value]="inventoryStore.searchText()"
          (textChanged)="inventoryStore.setSearchText($event)"
        />
      </nz-input-group>
      <button nz-button nz-dropdown [nzDropdownMenu]="exportMenu" nzPlacement="bottomRight" disabled>
        <nz-icon nzType="export" /> Exportar
      </button>
      </div>
    </div>

    <pos-crud-table
      [columns]="columns"
      [scroll]="{ y: 'calc(100vh - 13.2rem)' }"
    />

    <ng-template #suffixIconButton>
      <button nz-button nzType="primary" nzSearch>
        <span nz-icon nzType="search"></span>
      </button>
    </ng-template>

    <nz-dropdown-menu #exportMenu="nzDropdownMenu">
      <ul nz-menu>
        <li nz-menu-item>
          <nz-icon nzType="file-pdf" nzTheme="outline" />
          PDF
        </li>
        <li nz-menu-item>
          <nz-icon nzType="file-excel" nzTheme="outline" />
          CSV
        </li>
      </ul>
    </nz-dropdown-menu>

    <pos-form-modal [config]="formConfig()" (onClose)="onModalFormClose($event)" />
  `,
  providers: [
    Formatter, 
    DecimalPipe,
    { provide: CRUD_TABLE_STORE, useExisting: InventoryStore },
  ],
})
export class Inventory extends CtrlCommander implements OnInit {

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // Implement the handleKeyDownEvent method from the CtrlCommander class
  // to handle the keydown event
  @HostListener("document:keydown", ["$event"])
  protected handleKeyDownEvent(event: KeyboardEvent) {
    this.handleCtrlCommands(event);
  }
  
  formatter = inject(Formatter);
  inventoryStore = inject(InventoryStore);

  formConfig = computed(() => ({
    name: { label: 'Nombre', type: 'string', control: ['', Validators.required] },
    categoryId: { label: 'Categoría', type: 'autocomplete', control: ['', Validators.required], options: this.inventoryStore.categoriesSelectOpts() },
    description: { label: 'Descripción', type: 'text', control: '' },
    stock: { label: 'Stock', type: 'number', control: '' },
    price: { label: 'Precio', type: 'number', control: ['', [Validators.required, Validators.min(0)]] },
    cost: { label: 'Costo', type: 'number', control: ['', [Validators.required, Validators.min(0)]] },
  }));

  columns: Column<Product>[] = [
    { key: 'id', label: 'ID', width: '90px' },
    { key: 'name', label: 'Nombre', width: '300px' },
    { key: 'categoryId', label: 'Categoría', width: '120px' },
    { key: 'stock', label: 'Stock', width: '90px' },
    { key: 'price', label: 'Precio', width: '120px' },
    { key: 'cost', label: 'Costo', width: '120px' },
  ];

  constructor() {
    super({
      'n': () => this.onNewProduct(),
      'b': () => this.searchInput.nativeElement.focus(),
    });
  }

  ngOnInit() {
    this.inventoryStore.load();
  }

  onNewProduct() {
    this.inventoryStore.showModalForm('Nuevo producto', null);
  }

  onEditProduct(product: Product) {
    this.inventoryStore.showModalForm('Editar producto', product);
  }

  onModalFormClose(event: {formValue: any, apiCalled: boolean}) {
    if (event.apiCalled) {
      this.inventoryStore.load();
    }
  }
}