import { computed, inject } from "@angular/core";
import { signalStore, withHooks, withState, patchState, withComputed, withMethods } from "@ngrx/signals";
import { Product, Catalog } from "@pos/models";

import { InventoryService } from "./inventory-service";
import { ApiService } from "../api";
import { withCrudTable } from "../shared/with-crud-table";
import { ProductViewModel } from "../view-models/product.view-model";

export const InventoryStore = signalStore(
  { providedIn: 'root' },
  withCrudTable<ProductViewModel, Product>(InventoryService),
  withState({
    categories: [] as Catalog[],
  }),
  withComputed((store) => ({
    categoriesSelectOpts: computed(() => store.categories().map(category => ({ label: category.name, value: category.id }))),
  })),
  withMethods((store, api = inject(ApiService)) => ({
    async loadCategories() {
      try {
        const categories = await api.getCategories();
        patchState(store, { categories });
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    }
  })),
  withHooks({
    onInit: (store) => {
      store.loadCategories();
    }
  })
);