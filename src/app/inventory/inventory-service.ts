import { inject, Injectable } from "@angular/core";
import { PageParams, ProductDTO, ProductEntity, Page } from "@pos/models";
import { FormGroup } from "@angular/forms";
import { map, Observable, tap } from "rxjs";
import { ApiService } from "../api";
import { ICrudService } from "../shared/crud-service";

@Injectable({
  providedIn: 'root'
})
export class InventoryService implements ICrudService<ProductEntity, ProductDTO> {
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

  create(product: ProductEntity): Promise<ProductDTO> {
    return this.api.createProduct(product);
  }

  update(product: ProductEntity): Promise<ProductDTO> {
    return this.api.updateProduct(product);
  }

  delete(product: ProductEntity): Promise<ProductDTO> {
    return this.api.deleteProduct(product.id);
  }

  getFormValue(product: ProductEntity | null, form: FormGroup): ProductEntity {
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
    
    return formValue as ProductDTO;
  }

  findItem(items: ProductEntity[], selectedItem: ProductEntity): ProductEntity {
    return items.find(item => item.id === selectedItem.id) || items[0];
  }
} 