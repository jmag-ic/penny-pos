import { Component, computed, inject, input, OnInit, output } from "@angular/core";

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

export type AllowedOperations = {
  create?: boolean;
  update?: boolean;
  delete?: boolean;
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
          @if(hasAnyOperation()) {
            <th nzWidth="90px" nzRight>
              @if(allowedOperations().create) {
                <button nz-button nzType="primary" style="width: 100%;" (click)="onNew()">
                  <nz-icon nzType="plus" />
                </button>
              }
            </th>
          }
        </tr>
      </thead>
      <tbody>
        @for(item of formattedItems(); let i = $index; track i) {
          <tr
            [class.selected]="store.selectedItem() === item"
            (click)="store.setSelectedItem(item)"
          >
            @for(column of columns(); let j = $index; track j) {
              <td>{{ item[column.key] }}</td>
            }
            <!-- Actions column -->
            @if(hasAnyOperation()) {
              <td nzRight>
                <div style="display: flex; justify-content: center; gap: 4px;">
                  @if(allowedOperations().update) {
                    <button nz-button nzType="default" nzShape="circle" (click)="onEdit(item)">
                      <i nz-icon nzType="edit" nzTheme="outline"></i>
                    </button>
                  }
                  @if(allowedOperations().delete) {
                    <button nz-button nzType="default" nzShape="circle" nzDanger (click)="onDelete(item)">
                      <i nz-icon nzType="delete" nzTheme="outline"></i>
                    </button>
                  }
                </div>
              </td>
            }
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
  filterRemoved = output<string>();

  allowedOperations = input<AllowedOperations>({ 
    create: true, 
    update: true, 
    delete: true 
  });

  filters = computed(() => {
    const filters = this.store.getFilters()
    return Object.entries(filters).filter(([_, value]) => value).map(([key, value]) => {
      const conditions = Array.isArray(value) ? value : [value];
      const values = conditions.map(c => c && typeof c === 'object' && 'value' in c ? c.value : '').filter(Boolean);
      return {
        key,
        label: this.columns().find(c => c.key === key)?.label ?? key,
        value: values.join(', ')
      };
    });
  });

  sorts = computed(() => Object.entries(this.store.orderBy())
    .map(([key, value]) => ({ key, label: this.columns().find(c => c.key === key)?.label ?? key, direction: value as 'ascend' | 'descend' }))
  );

  formattedItems = computed(() => this.store.items().map(item => {
    const newItem = {} as T;  
    this.columns().map(column => {
      newItem[column.key] = column.format ? column.format(item[column.key]) : item[column.key];
    });
    return newItem;
  }));

  hasAnyOperation = computed(() => {
    const ops = this.allowedOperations();
    return ops.create || ops.update || ops.delete;
  });

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

  onRemoveFilter(key: string) {
    this.store.setFilters({
      ...this.store.getFilters(),
      [key]: null
    });
    this.filterRemoved.emit(key);
  }

  onRemoveSort(key: string) {
    this.store.setOrderBy(key, null);
  }
}



