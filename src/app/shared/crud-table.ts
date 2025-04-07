import { Component, inject, input, InjectionToken } from "@angular/core";
import { NzTableModule } from "ng-zorro-antd/table";
import { ICrudTableStore, CRUD_TABLE_STORE } from "./with-crud-table";

export type Column<T> = {
  key: keyof T;
  label: string;
  format?: (value: any) => any;
}

@Component({
  selector: 'pos-crud-table',
  imports: [NzTableModule],
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
              [nzSortDirections]="['ascend', 'descend', null]"
              [nzSortOrder]="store.getSortOrder(column.key.toString())"
              (nzSortOrderChange)="onSortOrderChange(column.key.toString(), $event)"
            >{{ column.label }}</th>
          }
        </tr>
      </thead>
      <tbody>
        @for(row of store.items(); let i = $index; track i) {
          <tr>
            @for(column of columns(); let j = $index; track j) {
              <td>{{ column.format ? column.format(row[column.key]) : row[column.key] }}</td>
            }
          </tr>
        }
      </tbody>
    </nz-table>
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



