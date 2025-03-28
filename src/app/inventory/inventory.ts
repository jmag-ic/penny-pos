import { Component, inject, OnInit } from "@angular/core";
import { DecimalPipe } from "@angular/common";

import { NzButtonModule } from "ng-zorro-antd/button";
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
        pos-input-debouncer
        pos-input-cleaner
        [value]="inventoryStore.searchText()"
        (textChanged)="inventoryStore.setSearchText($event)"
      />
    </nz-input-group>
    
    <ng-template #suffixIconButton>
      <button nz-button nzType="primary" nzSearch>
        <span nz-icon nzType="search"></span>
      </button>
    </ng-template>
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