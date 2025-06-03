import { inject, Injectable } from "@angular/core";
import { PageParams, SaleDTO, SaleEntity, Page } from "@pos/models";
import { FormGroup } from "@angular/forms";
import { Observable } from "rxjs";
import { ApiService } from "../api";
import { ICrudService } from "../shared/crud-service";

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

  update(_: SaleEntity): Promise<SaleDTO> {
    throw new Error('Method not implemented.');
  }

  getFormValue(_: SaleEntity | null, form: FormGroup): SaleEntity {
    throw new Error('Method not implemented.');
  }

  findItem(items: SaleEntity[], selectedItem: SaleEntity): SaleEntity {
    return items.find(item => item.id === selectedItem.id) || items[0];
  }
}



