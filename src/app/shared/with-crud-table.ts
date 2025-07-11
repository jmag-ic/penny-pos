import { computed, inject, InjectionToken, ProviderToken } from "@angular/core";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { signalStoreFeature, withState, withMethods, patchState, withComputed } from "@ngrx/signals";
import { pipe, tap, map, switchMap, catchError, of } from "rxjs";

import { NzNotificationService } from "ng-zorro-antd/notification";

import { Filter, OrderBy, SortOrder } from "@pos/models";

import { withCrudModalForm, IModalFormStore } from "./with-crud-modal-form";
import { ICrudService } from "./crud-service";

export const CRUD_TABLE_STORE = new InjectionToken<ICrudTableStore<any>>('CRUD_TABLE_STORE');

export type ItemMetadata<T> = {
  elementGender: 'f' | 'm';
  elementName: string;
  idField: keyof T;
  nameField: keyof T;
}

export type CrudTableState<T> = {
  currentPage: number;
  items: T[];
  loadingTable: boolean;
  metadata: ItemMetadata<T>;
  orderBy: OrderBy<T>;
  pageSize: number;
  filters: {[key in keyof T]?: Filter};
  displayFilters: { [key in keyof T]?: Filter };
  selectedItem: T | null;
  total: number;
}

export interface ICrudTableStore<T> extends IModalFormStore<T> {
  // table state
  currentPage: () => number;
  items: () => T[];
  loadingTable: () => boolean;
  metadata: () => ItemMetadata<T>;
  orderBy: () => OrderBy<T>;
  pageSize: () => number;
  selectedItem: () => T;
  total: () => number;
  // Getters
  getFilters: () => {[key in keyof T]?: Filter};
  getDisplayFilters: () => {[key in keyof T]?: Filter};
  getSortOrder: (key: string) => SortOrder;
  // Setters
  setCurrentPage: (page: number) => void;
  setFilters: (filters: {[key in keyof T]?: Filter}) => void;
  setMetadata: (metadata: ItemMetadata<T> | undefined) => void;
  setOrderBy: (key: string, order: SortOrder | null) => void;
  setPageSize: (size: number) => void;
  setSelectedItem: (item: T) => void;
  // Methods
  delete: (item: T) => Promise<void>;
  load: () => void;
  // Overrides
  create: (item: T) => Promise<T>;
  update: (item: T) => Promise<T>;
}

export const withCrudTable = <T, D>(
  CrudService: ProviderToken<ICrudService<T, D>>,
) => {
  const initialState: CrudTableState<T> = {
    currentPage: 1,
    items: [],
    loadingTable: false,
    orderBy: {},
    pageSize: 20,
    filters: {},
    displayFilters: {},
    selectedItem: null,
    total: 0,
    metadata: {
      elementGender: 'm',
      elementName: 'elemento',
      idField: 'id' as keyof T,
      nameField: 'name' as keyof T,
    },
  }

  return signalStoreFeature(
    withState(initialState),
    withCrudModalForm(CrudService),
    withComputed((store) => ({
      totalPages: computed(() => Math.ceil(store.total() / store.pageSize())),
      hasNextPage: computed(() => store.currentPage() < Math.ceil(store.total() / store.pageSize())),
      hasPreviousPage: computed(() => store.currentPage() > 1),
      elementName: computed(() => store.metadata().elementName),
      elementSubject: computed(() => `${store.metadata().elementGender === 'm' ? 'el' : 'la'} ${store.metadata().elementName}`),
    })),
    withMethods(store => {
      const crudService = inject(CrudService);
      const notification = inject(NzNotificationService);

      return {
        getItemLabel: (item: T) => {
          return item[store.metadata().nameField];
        },
        getFilters: () => {
          return store.filters();
        },
        getDisplayFilters: () => {
          return store.displayFilters();
        },
        getSortOrder: (key: keyof T) => {
          return store.orderBy()[key] ?? null;
        },
        // Setters
        setFilters(filters: {[key in keyof T]?: Filter}) {
          patchState(store, { filters });
          this.load();
        },
        setCurrentPage(page: number) {
          if (page >= 1 && page <= store.totalPages()) {
            patchState(store, { currentPage: page });
          }
          this.load();
        },
        setMetadata(metadata: ItemMetadata<T> | undefined) {
          if (!metadata) {
            return;
          }
          patchState(store, { metadata });
        },
        setOrderBy(field: keyof T, order: SortOrder) {
          let orderBy = { ...store.orderBy() };

          if (!order) {
            delete orderBy[field];
          } else {
            orderBy[field] = order;
          }
          
          patchState(store, { orderBy: orderBy });
          this.load();
        },
        setPageSize(size: number) {
          patchState(store, {
            pageSize: size,
            currentPage: 1
          });
          this.load();

        },
        setSelectedItem(item: T) {
          patchState(store, { selectedItem: item });
        },
        async delete (item: T) {
          try {
            await crudService.delete(item);
            notification.create(
              'success',
              `Eliminar ${store.metadata().elementName}`,
              `<b>${this.getItemLabel(item)}</b> eliminado correctamente`
            );
            this.load();
          } catch (error) {
            console.error(error);
            notification.create(
              'error',
              `Eliminar ${store.metadata().elementName}`,
              `Error al eliminar ${store.elementSubject()} <b>${this.getItemLabel(item)}</b>`
            );
          }
        },
        // Methods
        load: rxMethod<void>(
          pipe(
            // Start loading
            tap(() => patchState(store, { loadingTable: true })),
            // Build the page params object   
            map(() => {
              const offset = (store.currentPage() - 1) * store.pageSize();
              return {
                filter: store.filters(),
                limit: store.pageSize(),
                orderBy: store.orderBy(),
                offset
            }}),
            // Load the page
            switchMap((pageParams) => crudService.load(pageParams).pipe(
              // Handle errors
              catchError((error: Error) => {
                console.error('Error loading data:', error);
                notification.error('Error al cargar datos', `${error.message}`, { nzDuration: 0 });
                return of({ items: [], total: 0 });
              })
            )),
            // Update the store
            tap((page) => patchState(store, { 
              items: page.items,
              total: page.total,
              loadingTable: false,
              selectedItem: store.selectedItem()
                ? crudService.findItem(page.items, store.selectedItem() as T)
                : page.items[0]
            }))
          )
        ),
        // Overrides
        async create(item: T) {
          try {
            await store.create(item);
            notification.create(
              'success',
              `Nuevo ${store.metadata().elementName}`,
              `<b>${this.getItemLabel(item)}</b> creado correctamente`
            );
            this.load();
          } catch (error) {
            notification.create(
              'error',
              `Crear ${store.metadata().elementName}`,
              `Error al crear ${store.elementSubject()} <b>${this.getItemLabel(item)}</b>`
            );
          }
        },
        // Overrides
        async update(item: T) {
          try {
            await store.update(item);
            notification.create(
              'success',
              `Actualizar ${store.metadata().elementName}`,
              `<b>${this.getItemLabel(item)}</b> actualizado correctamente`
            );
            this.load();
          } catch (error) {
            notification.create(
              'error',
              `Actualizar ${store.metadata().elementName}`,
              `Error al actualizar ${store.elementSubject()} <b>${this.getItemLabel(item)}</b>`
            );
          }
        }
      }
    })
  );
}