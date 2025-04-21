import { Component, computed, inject, input, OnInit, signal } from "@angular/core";

import { NzButtonModule } from "ng-zorro-antd/button";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzModalModule, NzModalService } from "ng-zorro-antd/modal";
import { NzTableModule } from "ng-zorro-antd/table";

import { ICrudTableStore, CRUD_TABLE_STORE, ItemMetadata } from "./with-crud-table";
import { PosTableFilters } from "./table-filters";

export type Column<T> = {
  key: keyof T;
  label: string;
  path?: string;
  width?: string;
  format?: (value: any) => any;
}

@Component({
  selector: 'pos-crud-table',
  imports: [NzButtonModule, NzIconModule, NzModalModule, NzTableModule, PosTableFilters],
  template: `
    <ng-template #totalTemplate>
      <span>
        Total: {{ store.total() }}
      </span>
    </ng-template>
    
    <pos-table-filters
      [filters]="filters()"
      [sorts]="sorts()"
      (onRemoveFilter)="onRemoveFilter($event)"
      (onRemoveSort)="onRemoveSort($event)"
    />
    <nz-table
      nzShowPagination
      nzShowSizeChanger
      [nzShowTotal]="totalTemplate"
      nzSize="small"
      nzBordered="true"
      nzPaginationType="small"
      [nzLoading]="store.loadingTable()"
      [nzData]="store.items()"
      [nzScroll]="scroll()"
      [nzShowPagination]="true"
      [nzFrontPagination]="false"
      [nzPageIndex]="store.currentPage()"
      [nzPageSize]="store.pageSize()"
      [nzTotal]="store.total()"
      (nzPageIndexChange)="store.setCurrentPage($event)"
      (nzPageSizeChange)="store.setPageSize($event)"
    >
      <thead>
        <tr>
          @for(column of columns(); let i = $index; track i) {
            <th
              [nzWidth]="column.width ?? null"
              [nzSortDirections]="['ascend', 'descend', null]"
              [nzSortOrder]="store.getSortOrder(column.key.toString())"
              (nzSortOrderChange)="onSortOrderChange(column.key.toString(), $event)"
            >{{ column.label }}</th>
          }
          <!-- Actions column -->
          <th nzWidth="90px" nzRight>
            <button nz-button nzType="primary" style="width: 100%;" (click)="onNew()">
              <nz-icon nzType="plus" />
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        @for(item of store.items(); let i = $index; track i) {
          <tr
            [class.selected]="store.selectedItem() === item"
            (click)="store.setSelectedItem(item)"
          >
            @for(column of columns(); let j = $index; track j) {
              @let value = getColumnValue(item, column);
              <td>{{ column.format ? column.format(value) : value }}</td>
            }
            <!-- Actions column -->
            <td nzRight>
              <div style="display: flex; justify-content: center; gap: 4px;">
                <button nz-button nzType="default" nzShape="circle" (click)="onEdit(item)">
                  <i nz-icon nzType="edit" nzTheme="outline"></i>
                </button> 
                <button nz-button nzType="default" nzShape="circle" nzDanger (click)="onDelete(item)">
                  <i nz-icon nzType="delete" nzTheme="outline"></i>
                </button>
              </div>
            </td>
          </tr>
        }
      </tbody>
    </nz-table>
  `,
  styles: `
    .selected {
      background-color: #bae7ff !important;
    }
  `
})
export class PosCrudTable<T extends Record<string, any>> implements OnInit {
  defaultPageSize = 20;
  columns = input<Column<T>[]>([]);
  scroll = input<{ x?: string | null, y?: string | null }>({ x: null, y: null });
  metadata = input<ItemMetadata<T>>();

  filters = computed(() => {
    const searchText = this.store.searchText()
    if (!searchText) {
      return [];
    }
    return [{ key: 'search', label: `Buscar`, value: searchText }];
  });

  sorts = computed(() => Object.entries(this.store.orderBy())
    .map(([key, value]) => ({ key, label: this.columns().find(c => c.key === key)?.label ?? key, direction: value as 'ascend' | 'descend' }))
  );

  protected store = inject<ICrudTableStore<T>>(CRUD_TABLE_STORE);
  protected modal = inject(NzModalService);

  protected onSortOrderChange(key: string, order: string | null): void {
    this.store.setOrderBy(key, order as 'ascend' | 'descend');
  }

  // set the metadata to the store
  ngOnInit() {
    this.store.setMetadata(this.metadata());
  }

  onNew() {
    this.store.showModalForm(`Nuevo ${this.store.elementName()}`, null);
  }

  onEdit(item: T) {
    this.store.showModalForm(`Editar ${this.store.elementName()}`, item);
  }

  onDelete(item: T) {
    const nameField = this.metadata()?.nameField;
    const description = nameField ? `<b style="color: red;">${item[nameField]}</b>` : '';
    this.modal.confirm({
      nzTitle: `¿Está seguro de eliminar ${this.store.elementSubject()}?`,
      nzContent: description,
      nzOkText: 'Si',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this.store.delete(item),
      nzCancelText: 'No'
    });
  }

  onRemoveFilter(_: string) {
    this.store.setSearchText('');
  }

  onRemoveSort(key: string) {
    this.store.setOrderBy(key, null);
  }

  protected getColumnValue(item: T, column: Column<T>): any {
    let value = item;
    
    const keys = (column.path ? column.path : column.key).toString().split('.');
    for (const key of keys) {
      if (!value) {
        return '';
      }
      value = value[key];
    }
    
    return column.format ? column.format(value) : value;
  }
}



