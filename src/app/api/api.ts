import { Injectable } from "@angular/core";
import { IAPI } from "@pos/api";
import { PageParams, ProductEntity, Page, ProductDTO, SaleDTO, SaleEntity } from "@pos/models";
import { toISOString } from "@pos/utils/dates";
import { from, map, Observable } from "rxjs";

const api = (<IAPI>((<any>window).api))

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  getSalesAmount(startDate: string, endDate: string): Promise<number> {
    return api.getSalesAmount(startDate, endDate);
  }

  checkout(saleDTO: Partial<SaleDTO>) {
    return api.checkout(saleDTO)
  }

  searchSales(pageParams: PageParams<SaleEntity>): Observable<Page<SaleDTO>> {
    return from(api.searchSales(pageParams)).pipe(
      map((page: Page<SaleDTO>) => pageItemsMap(page, (item: SaleDTO) => ({
        ...item,
        saleDate: toISOString(item.saleDate)
      })))
    );
  }

  deleteSale(id: number) {
    return api.deleteSale(id);
  }

  updateSale(sale: SaleEntity): Promise<SaleEntity> {
    return api.updateSale(sale);
  }

  searchProducts(pageParams: PageParams<ProductEntity>): Observable<Page<ProductDTO>> {
    return from(api.searchProducts(pageParams));
  }

  createProduct(product: ProductEntity) {    
    return api.createProduct(product);
  }

  updateProduct(product: ProductEntity) {
    return api.updateProduct(product);
  }

  deleteProduct(id: number) {
    return api.deleteProduct(id);
  }

  getProductsBulk(ids: number[]) {
    return api.getProductsBulk(ids);
  }

  getCategories() {
    return api.getCategories();
  }
}

function pageItemsMap<T>(page: Page<T>, mapper: (item: T) => T) {
  return {
    ...page,
    items: page.items.map((item: T) => ({
      ...item,
      ...mapper(item)
    }))
  }
}