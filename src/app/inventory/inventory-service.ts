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

  load(pageParams: PageParams<ProductEntity>): Observable<Page<ProductDTO>> {
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

  getFormValue(product: ProductDTO | null, form: FormGroup): ProductEntity {
    const formValue = form.getRawValue();

    // set the id if the product is not null (update)
    if (product !== null && product.id) {
      formValue.id = product.id;
    }

    // categoryId value is an  autocomplete object with value and label properties
    formValue.categoryId = formValue.categoryId?.value;
    
    // set default values if the fields are empty
    formValue.price = formValue.price ?? 0;
    formValue.cost = formValue.cost ?? 0;
    
    return formValue as ProductEntity;
  }

  findItem(items: ProductDTO[], selectedItem: ProductDTO): ProductDTO {
    return items.find(item => item.id === selectedItem.id) || items[0];
  }
} 