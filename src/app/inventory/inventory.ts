import { Component, inject, OnInit } from "@angular/core";
import { DecimalPipe } from "@angular/common";

import { NzButtonModule } from "ng-zorro-antd/button";
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzInputModule } from "ng-zorro-antd/input";

import { InventoryStore } from "./inventory-store";

import { CtrlCommander } from "../shared/ctrl-commander";
import { PosTable, Column } from "../shared/table";
import { Formatter } from "../shared/formatter";

import { InputCleaner } from "../shared/input-cleaner";
import { InputDebouncer } from "../shared/input-debouncer";

@Component({
  selector: 'pos-inventory',
  imports: [
    PosTable,
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
        <button nz-button nzType="primary">
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

    <pos-table-dynamic
      [columns]="columns"
      [store]="inventoryStore"
      [scroll]="{ y: 'calc(100vh - 13.2rem)' }"
    />
  `,
  providers: [Formatter, DecimalPipe],
})
export class Inventory extends CtrlCommander implements OnInit {
  formatter = inject(Formatter);
  inventoryStore = inject(InventoryStore);

  columns: Column[] = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'name', label: 'Nombre', type: 'text' },
    { key: 'stock', label: 'Stock', type: 'number' },
    { key: 'price', label: 'Precio', type: 'number', format: (value) => this.formatter.currency(value) },
    { key: 'cost', label: 'Costo', type: 'number', format: (value) => this.formatter.currency(value) },
  ];

  constructor() {
    super({
      'n': () => {},
    });
  }

  ngOnInit() {
    this.inventoryStore.load();
  }
}