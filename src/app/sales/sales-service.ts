import { inject, Injectable } from "@angular/core";
import { PageParams, SaleDTO, SaleEntity, Page } from "@pos/models";
import { FormGroup } from "@angular/forms";
import { Observable } from "rxjs";
import { ApiService } from "../api";
import { ICrudService } from "../shared/crud-service";
import { getStrDateTime } from "@pos/utils/dates";

@Injectable({
  providedIn: 'root'
})
export class SalesService implements ICrudService<SaleEntity, SaleDTO> {
  private api = inject(ApiService);

  load(pageParams: PageParams<SaleEntity>): Observable<Page<SaleDTO>> {
    return this.api.searchSales(pageParams);
  }

  delete(sale: SaleEntity): Promise<SaleDTO> {
    return this.api.deleteSale(sale.id);
  }

  // These methods are required by the interface but not needed for sales
  create(_: SaleEntity): Promise<SaleDTO> {
    throw new Error('Method not implemented.');
  }

  update(sale: SaleEntity): Promise<SaleDTO> {
    return this.api.updateSale(sale) as Promise<SaleDTO>;
  }

  getFormValue(sale: SaleEntity | null, form: FormGroup): SaleEntity {
    const formValue = form.value
    formValue.saleDate = getStrDateTime(formValue.saleDate);
    return { 
      id: sale?.id,
      customerName: formValue.customerName,
      paymentAmount: formValue.paymentAmount,
      paymentMethod: formValue.paymentMethod,
      saleDate: sale?.saleDate,
      totalAmount: sale?.totalAmount,
      ...formValue
    };
  }

  findItem(items: SaleEntity[], selectedItem: SaleEntity): SaleEntity {
    return items.find(item => item.id === selectedItem.id) || items[0];
  }
}



