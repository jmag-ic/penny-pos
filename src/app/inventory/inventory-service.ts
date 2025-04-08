import { inject, Injectable } from "@angular/core";
import { PageParams, Product } from "@pos/models";
import { ApiService } from "../api";
import { FormGroup } from "@angular/forms";
import { map } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private api = inject(ApiService);

  load(pageParams: PageParams) {
    return this.api.searchProducts(pageParams).pipe(map(
      page => ({
        ...page,
        items: page.items.map(item => ({
          ...item,
          price: item.price / 100,
          cost: item.cost / 100
        }))
      })
    ))
  }

  create(product: Product) {
    return this.api.createProduct(product);
  }

  update(product: Product) {
    return this.api.updateProduct(product);
  }

  delete(product: Product) {
    return this.api.deleteProduct(product);
  }

  getFormValue(product: Product, form: FormGroup): Product {
    const formValue = form.getRawValue();
    if (!!product && product.id) {
      formValue.id = product.id;
    }

    formValue.price = formValue.price > -1 ? +formValue.price*100 : 0;
    formValue.cost = formValue.cost > -1 ? +formValue.cost*100 : 0;
    
    return formValue as Product;
  }
} 