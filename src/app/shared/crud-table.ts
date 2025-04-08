import { Component, computed, inject, input } from "@angular/core";
import { NzTableModule } from "ng-zorro-antd/table";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzIconModule } from "ng-zorro-antd/icon";
import { ICrudTableStore, CRUD_TABLE_STORE } from "./with-crud-table";

export type Column<T> = {
  key: keyof T;
  label: string;
  width?: string;
  format?: (value: any) => any;
}

@Component({
  selector: 'pos-crud-table',
  imports: [NzTableModule, NzButtonModule, NzIconModule],
  template: `
    <ng-template #totalTemplate>
      <span>
        Total: {{ store.total() }}
      </span>
    </ng-template>
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
          <th nzWidth="100px"></th>
        </tr>
      </thead>
      <tbody>
        @for(item of store.items(); let i = $index; track i) {
          <tr
            [class.selected]="store.selectedItem() === item"
            (click)="store.setSelectedItem(item)"
          >
            @for(column of columns(); let j = $index; track j) {
              <td>{{ column.format ? column.format(item[column.key]) : item[column.key] }}</td>
            }
            <!-- Actions column -->
            <td>
              <div style="display: flex; justify-content: center; gap: 4px;">
                <button nz-button nzType="default" nzShape="circle" (click)="store.showModalForm('Editar elemento', item)">
                  <i nz-icon nzType="edit" nzTheme="outline"></i>
                </button> 
                <button nz-button nzType="default" nzShape="circle" nzDanger (click)="store.delete(item)">
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
export class PosCrudTable<T> {
  defaultPageSize = 20;
  columns = input<Column<T>[]>([]);
  scroll = input<{ x?: string | null, y?: string | null }>({ x: null, y: null });

  protected store = inject<ICrudTableStore<T>>(CRUD_TABLE_STORE);

  protected onSortOrderChange(key: string, order: string | null): void {
    this.store.setOrderBy(key, order as 'ascend' | 'descend' | null);
  }
}



