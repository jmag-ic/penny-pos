import { computed, inject } from "@angular/core";
import { signalStore, withHooks, withState, patchState, withComputed, withMethods } from "@ngrx/signals";
import { Product, Catalog } from "@pos/models";

import { withPagination } from "../shared/with-pagination";
import { withCrudOperations } from "../shared/with-crud-operations";

import { InventoryService } from "./inventory-service";
import { ApiService } from "../api";

export const InventoryStore = signalStore(
  { providedIn: 'root' },
  withPagination<Product>(InventoryService),
  withCrudOperations<Product>(InventoryService),
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