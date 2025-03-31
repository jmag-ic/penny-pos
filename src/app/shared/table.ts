import { Component, input } from "@angular/core";
import { NzTableModule } from "ng-zorro-antd/table";
import { IPaginationStore } from "./with-pagination";

export type Column = {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  format?: (value: any) => any;
}

@Component({
  selector: 'pos-table-dynamic',
  imports: [NzTableModule],
  template: `
    <ng-template #totalTemplate>
      <span>
        Total: {{ store()?.total() ?? 0 }}
      </span>
    </ng-template>
    <nz-table
      nzShowPagination
      nzShowSizeChanger
      [nzShowTotal]="totalTemplate"
      nzSize="small"
      nzBordered="true"
      nzPaginationType="small"
      [nzLoading]="store()?.loading()"
      [nzData]="store()?.items() ?? []"
      [nzScroll]="scroll()"
      [nzShowPagination]="true"
      [nzFrontPagination]="false"
      [nzPageIndex]="store()?.currentPage() ?? 1"
      [nzPageSize]="store()?.pageSize() ?? defaultPageSize"
      [nzTotal]="store()?.total() ?? 0"
      (nzPageIndexChange)="store()?.setCurrentPage($event)"
      (nzPageSizeChange)="store()?.setPageSize($event)"
    >
      <thead>
        <tr>
          @for(column of columns(); track column.key) {
            <th
              [nzSortDirections]="['ascend', 'descend', null]"
              [nzSortOrder]="store()?.getSortOrder(column.key) ?? null"
              (nzSortOrderChange)="store()?.setOrderBy(column.key, $event)"
            >{{ column.label }}</th>
          }
        </tr>
      </thead>
      <tbody>
        @for(row of store()?.items() ?? []; let i = $index; track i) {
          <tr>
            @for(column of columns(); track column.key) {
              <td>{{ column.format ? column.format(row[column.key]) : row[column.key] }}</td>
            }
          </tr>
        }
      </tbody>
    </nz-table>
  `,
})
export class PosTable {
  defaultPageSize = 20;
  columns = input<Column[]>([]);
  store = input<IPaginationStore>();
  scroll = input<{ x?: string | null, y?: string | null }>({ x: null, y: null });
}



