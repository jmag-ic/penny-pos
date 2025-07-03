import { Injectable } from "@angular/core";
import { IAPI } from "@pos/api";
import { PageParams, ProductEntity, Page, ProductDTO, SaleDTO, SaleEntity } from "@pos/models";
import { from, Observable } from "rxjs";

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
    return from(api.searchSales(pageParams));
  }

  deleteSale(id: number) {
    return api.deleteSale(id);
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

  getCategories() {
    return api.getCategories();
  }
}