import { Injectable } from "@angular/core";
import { IAPI } from "@pos/api";
import { PageParams, ProductEntity, Page, ProductDTO, SaleDTO } from "@pos/models";
import { from, Observable } from "rxjs";

const api = (<IAPI>((<any>window).api))

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  checkout(saleDTO: Partial<SaleDTO>) {
    return api.checkout(saleDTO)
  }

  searchProducts(pageParams: PageParams): Observable<Page<ProductDTO>> {
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