import { computed, inject } from "@angular/core";
import { signalStore, withHooks, withState, patchState, withComputed, withMethods } from "@ngrx/signals";
import { ProductEntity, CatalogEntity, ProductDTO } from "@pos/models";

import { InventoryService } from "./inventory-service";
import { ApiService } from "../api";
import { withCrudTable } from "../shared/with-crud-table";

export const InventoryStore = signalStore(
  { providedIn: 'root' },
  withCrudTable<ProductEntity, ProductDTO>(InventoryService),
  withState({
    searchText: '',
    categories: [] as CatalogEntity[],
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
    },
    setSearchText(searchText: string) {
      patchState(store, {
        searchText,
        filters: searchText ? {
          ...store.getFilters(),
          name: {
            value: searchText,
            op: 'like'
          }
        } : {}
      });
      store.load();
    }
  })),
  withHooks({
    onInit: (store) => {
      store.loadCategories();
    }
  })
);