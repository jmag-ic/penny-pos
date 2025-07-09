import { Component, HostListener, inject, OnInit, ViewChild, ElementRef, computed } from "@angular/core";
import { Validators } from "@angular/forms";

import { NzButtonModule } from "ng-zorro-antd/button";
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzInputModule } from "ng-zorro-antd/input";

import { ProductDTO } from "@pos/models";

import { CtrlCommander } from "../shared/ctrl-commander";
import { Formatter } from "../shared/formatter";
import { InputCleaner } from "../shared/input-cleaner";
import { InputDebouncer } from "../shared/input-debouncer";
import { PosCrudModalForm } from "../shared/crud-modal-form";
import { Column, PosCrudTable } from "../shared/crud-table";
import { CRUD_TABLE_STORE, ItemMetadata } from "../shared/with-crud-table";

import { InventoryStore } from "./inventory-store";
import { MODAL_FORM_STORE } from "../shared/with-crud-modal-form";

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
      <nz-input-group nzSearch [nzAddOnAfter]="suffixIconButton" style="width: 50%;">
        <input
          #searchInput
          type="text"
          placeholder="Buscar producto..."
          nz-input
          inputDebouncer
          inputCleaner
          [value]="inventoryStore.searchText()"
          (textChanged)="inventoryStore.setSearchText($event)"
        />
      </nz-input-group>
      
      <div style="display: flex; justify-content: space-between;">
      

      <nz-button-group>
        <button nz-button nzType="default" disabled>
          <nz-icon nzType="import" />
          Importar
        </button>
        <button nz-button nz-dropdown [nzDropdownMenu]="exportMenu" nzPlacement="bottomRight" disabled>
          <nz-icon nzType="export" /> Exportar
        </button>
      </nz-button-group>
      </div>
    </div>

    <pos-crud-table
      [columns]="columns()"
      [metadata]="metadata()"
      [scroll]="{ y: 'calc(100vh - 15.7rem)' }"
      (filterRemoved)="inventoryStore.setSearchText('')"
    />

    <ng-template #suffixIconButton>
      <button nz-button nzType="primary" nzSearch>
        <span nz-icon nzType="search"></span>
      </button>
      <button 
        nz-button 
        nzType="default" 
        [disabled]="!inventoryStore.searchText()"
        (click)="clearSearch()"
        class="ml-1"
      >
        <span nz-icon nzType="close"></span>
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

    <pos-form-modal [config]="formConfig()" />
  `,
  providers: [
    { provide: CRUD_TABLE_STORE, useExisting: InventoryStore },
    { provide: MODAL_FORM_STORE, useExisting: InventoryStore },
  ],
})
export class Inventory extends CtrlCommander implements OnInit {

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild(PosCrudTable) crudTable!: PosCrudTable<ProductDTO>;

  // Implement the handleKeyDownEvent method from the CtrlCommander class
  // to handle the keydown event
  @HostListener("document:keydown", ["$event"])
  protected handleKeyDownEvent(event: KeyboardEvent) {
    this.handleCtrlCommands(event);
  }
  
  formatter = inject(Formatter);
  inventoryStore = inject(InventoryStore);

  formConfig = computed(() => ({
    name: {
      label: 'Nombre',
      type: 'string',
      control: ['', Validators.required],
      alphanumeric: { case: 'uppercase' as const }
    },
    categoryId: {
      label: 'Categoría',
      type: 'autocomplete',
      control: ['', Validators.required],
      options: this.inventoryStore.categoriesSelectOpts(),
      alphanumeric: { case: 'uppercase' as const }
    },
    description: {
      label: 'Descripción',
      type: 'text',
      control: ''
    },
    stock: {
      label: 'Stock',
      type: 'number',
      control: ''
    },
    price: {
      label: 'Precio',
      type: 'number',
      control: ['', [Validators.required, Validators.min(0)]],
    },
    cost: {
      label: 'Costo',
      type: 'number',
      control: ['', [Validators.required, Validators.min(0)]]
    }
  }));

  columns = computed(() => [
    {
      key: 'id',
      label: 'ID',
      width: '90px'
    }, {
      key: 'name',
      label: 'Nombre',
      width: '300px'
    }, {
      key: 'categoryId',
      label: 'Categoría',
      path: 'category.name',
      width: '120px'
    }, {
      key: 'stock',
      label: 'Stock',
      width: '90px'
    }, {
      key: 'price',
      label: 'Precio',
      width: '120px',
      format: (v) => this.formatter.currency(v)
    }, {
      key: 'cost',
      label: 'Costo',
      width: '120px',
      format: (v) => this.formatter.currency(v)
    }
  ] as Column<ProductDTO>[]);

  metadata = computed(() => ({
    elementName: 'producto',
    elementGender: 'm' as const,
    idField: 'id',
    nameField: 'name',
  } as ItemMetadata<ProductDTO>));

  constructor() {
    super({
      'n': () => this.crudTable.onNew(),
      'b': () => this.searchInput.nativeElement.focus(),
    });
  }

  ngOnInit() {
    this.inventoryStore.load();
  }

  clearSearch() {
    this.inventoryStore.setSearchText('');
    this.searchInput.nativeElement.focus();
  }
}