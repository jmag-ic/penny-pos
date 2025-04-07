import { inject, Injectable } from "@angular/core";
import { PageParams, Product } from "@pos/models";
import { ApiService } from "../api";
import { FormGroup } from "@angular/forms";

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private api = inject(ApiService);

  load(pageParams: PageParams) {
    return this.api.searchProducts(pageParams)
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

    formValue.price = formValue.price ? +formValue.price*100 : null;
    formValue.cost = formValue.cost ? +formValue.cost*100 : null;
    
    return formValue as Product;
  }
} 