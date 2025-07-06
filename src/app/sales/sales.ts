import { Component, computed, inject, OnInit } from "@angular/core";
import { FormsModule, Validators } from "@angular/forms";
import { PosCrudTable } from "../shared/crud-table";
import { NzDatePickerModule } from "ng-zorro-antd/date-picker";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzDropDownModule } from "ng-zorro-antd/dropdown";
import { NzFormModule } from "ng-zorro-antd/form";
import { Formatter } from "../shared/formatter";
import { CRUD_TABLE_STORE, ItemMetadata } from "../shared/with-crud-table";
import { SalesStore } from "./sales-store";
import { SaleDTO } from "@pos/models";
import { Column } from "../shared/crud-table";
import { PosCrudModalForm } from "../shared/crud-modal-form";
import { MODAL_FORM_STORE } from "../shared/with-crud-modal-form";
import { SaleItemsTable } from "./sale-items-table";

const SALE_DATE_FORMAT = 'dd/MM/yyyy HH:mm';

@Component({
  selector: 'pos-sales',
  standalone: true,
  imports: [
    FormsModule,
    PosCrudTable,
    NzDatePickerModule,
    NzButtonModule,
    NzIconModule,
    NzDropDownModule,
    NzFormModule,
    PosCrudModalForm,
],
  template: `
    <div style="display: flex; justify-content: space-between; align-items: center;" class="mb-3">
      <nz-range-picker
        style="width: 300px;"
        [nzShowTime]="false"
        [nzFormat]="'dd/MM/yyyy'"
        [nzPlaceHolder]="['Fecha inicio', 'Fecha fin']"
        [ngModel]="salesStore.dateRange()"
        (ngModelChange)="onDateRangeChange($event)"
      />

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
      [allowedOperations]="{ create: false, update: true, delete: true }"
      [expand]="expandConfig"
      (filterRemoved)="salesStore.setDateRange(null)"
    />

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
    { provide: CRUD_TABLE_STORE, useExisting: SalesStore },
    { provide: MODAL_FORM_STORE, useExisting: SalesStore }
  ],
})
export class Sales implements OnInit {
  formatter = inject(Formatter);
  salesStore = inject(SalesStore);

  onDateRangeChange(range: [Date | null, Date | null]) {
    if (!range[0] || !range[1]) {
      return;
    }
    this.salesStore.setDateRange(range);
  }

  columns = computed(() => [
    {
      key: 'id',
      label: 'ID',
      width: '90px'
    }, {
      key: 'saleDate',
      label: 'Fecha',
      width: '150px',
      format: (v) => this.formatter.dale(v, SALE_DATE_FORMAT)
    }, {
      key: 'customerName',
      label: 'Cliente',
      width: '200px'
    }, {
      key: 'paymentMethod',
      label: 'Método de pago',
      width: '150px'
    }, {
      key: 'totalAmount',
      label: 'Total',
      width: '120px',
      format: (v) => this.formatter.currency(v)
    }, {
      key: 'paymentAmount',
      label: 'Pagado',
      width: '120px',
      format: (v) => this.formatter.currency(v)
    }
  ] as Column<SaleDTO>[]);

  metadata = computed(() => ({
    elementName: 'venta',
    elementGender: 'f' as const,
    idField: 'id',
    nameField: 'customerName',
  } as ItemMetadata<SaleDTO>));

  formConfig = computed(() => ({
    saleDate: {
      label: 'Fecha',
      type: 'date',
      control: ['', Validators.required],
      transform: (value: string) => new Date(value)
    },
    customerName: {
      label: 'Cliente',
      type: 'string',
      control: ['', Validators.required]
    },
    paymentMethod: {
      label: 'Método de pago',
      type: 'string',
      control: ['', Validators.required]
    },
    paymentAmount: {
      label: 'Pagado',
      type: 'number',
      control: ['', Validators.required]
    },
  }));

  expandConfig = {
    key: 'items' as keyof SaleDTO,
    component: SaleItemsTable
  };

  ngOnInit() {
    // Set default order by sale date descending
    this.salesStore.setOrderBy('saleDate', 'descend');
    this.salesStore.load();
  }
}
