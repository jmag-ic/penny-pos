import { inject, Injectable } from "@angular/core";
import { PageParams, ProductDTO, ProductEntity, Page } from "@pos/models";
import { FormGroup } from "@angular/forms";
import { map, Observable } from "rxjs";
import { ApiService } from "../api";

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private api = inject(ApiService);

  load(pageParams: PageParams): Observable<Page<ProductDTO>> {
    return this.api.searchProducts(pageParams).pipe(
      map(page => ({
        ...page,
        items: page.items.map(item => ({
          ...item,
          price: item.price,
          cost: item.cost
        }))
      }))
    )
  }

  create(product: ProductDTO): Promise<ProductDTO> {
    return this.api.createProduct(product);
  }

  update(product: ProductDTO): Promise<ProductDTO> {
    return this.api.updateProduct(product);
  }

  delete(product: ProductDTO): Promise<ProductDTO> {
    return this.api.deleteProduct(product.id);
  }

  getFormValue(product: ProductDTO, form: FormGroup): ProductEntity {
    const formValue = form.getRawValue();
    if (!!product && product.id) {
      formValue.id = product.id;
    }

    formValue.price = formValue.price > -1 ? +formValue.price : 0;
    formValue.cost = formValue.cost > -1 ? +formValue.cost : 0;
    
    return formValue as ProductEntity;
  }
} 