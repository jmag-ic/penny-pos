import { Component, input, output } from "@angular/core";
import { NzTagModule } from "ng-zorro-antd/tag";
import { NzIconModule } from "ng-zorro-antd/icon";
import { CommonModule } from "@angular/common";

export type Filter = {
  key: string;
  label: string;
  value: any;
  operator?: string;
}

export type Sort = {
  key: string;
  label: string;
  direction: 'ascend' | 'descend'; 
}

@Component({
  selector: 'pos-table-filters',
  standalone: true,
  imports: [CommonModule, NzTagModule, NzIconModule],
  template: `
    <div class="filters-container">
      <nz-tag nzColor="geekblue">
        <i nz-icon nzType="filter"></i>
        @if (filters().length == 0) {
          <span>Sin filtros</span>
        } @else {
          <span>Filtros</span>
        }
      </nz-tag>
      
      <!-- Filters -->
      @for (filter of filters(); track filter) {
        <nz-tag nzColor="gold"
          [nzMode]="'closeable'"
          (nzOnClose)="onRemoveFilter.emit(filter.key)"
        >
          {{ filter.label }}: {{ filter.value }}
          @if (filter.operator) {
            ({{ filter.operator }})
          }
        </nz-tag>
      }

     
      <!-- Sort -->
      @if (sorts().length > 0) {
        <nz-tag nzColor="geekblue">
          <i nz-icon nzType="sort-ascending"></i>
          <span>Ordenar por</span>
        </nz-tag>
      }
      @for (sort of sorts(); let i = $index; track sort) {
        <nz-tag nzColor="gold"
          [nzMode]="'closeable'"
          (nzOnClose)="onRemoveSort.emit(sort.key)"
        >
          {{ sort.label }}
          <i nz-icon [nzType]="sort.direction === 'ascend' ? 'sort-ascending' : 'sort-descending'"></i>
        </nz-tag>
      }
    </div>
  `,
  styles: [`
    .filters-container {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 10px;
      align-items: center;
      min-height: 22px;
    }

    .sort-label {
      font-size: 12px;
      margin-right: 4px;      
    }
  `]
})
export class PosTableFilters {
  filters = input<Filter[]>([]);
  sorts = input<Sort[]>([]);
  onRemoveFilter = output<string>();
  onRemoveSort = output<string>();
} 