import { Injectable } from "@angular/core";
import { IAPI } from "@pos/electron/api";
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
    return from(api.searchItems(pageParams));
  }

  createProduct(product: ProductEntity) {    
    return api.createItem(product);
  }

  updateProduct(product: ProductEntity) {
    return api.updateItem(product);
  }

  deleteProduct(product: ProductEntity) {
    return api.deleteItem(product.id);
  }

  getCategories() {
    return api.getCategories();
  }
}