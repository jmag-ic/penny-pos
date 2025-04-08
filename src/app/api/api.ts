import { Injectable } from "@angular/core";
import { IAPI } from "@pos/electron/api";
import { PageParams, Product, Page } from "@pos/models";
import { from, Observable } from "rxjs";
import { ProductViewModel } from "../view-models/product.view-model";

const api = (<IAPI>((<any>window).api))

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  checkout(items: any[], paymentAmount: number, customerName: string, paymentMethod: string) {
    return api.checkout(items, paymentAmount, customerName, paymentMethod)
  }

  searchProducts(pageParams: PageParams): Observable<Page<ProductViewModel>> {
    return from(api.searchItems(pageParams));
  }

  createProduct(product: Product) {    
    return api.createItem(product);
  }

  updateProduct(product: Product) {
    return api.updateItem(product);
  }

  deleteProduct(product: Product) {
    return api.deleteItem(product);
  }

  getCategories() {
    return api.getCategories();
  }
}