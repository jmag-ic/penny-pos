import { inject, Injectable } from "@angular/core";
import { PageParams } from "@pos/models";
import { ApiService } from "../api";

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private api = inject(ApiService);

  load(pageParams: PageParams) {
    return this.api.searchProducts(pageParams)
  }
} 