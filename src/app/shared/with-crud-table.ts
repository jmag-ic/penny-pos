import { computed, inject, InjectionToken, ProviderToken } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { signalStoreFeature, withState, withMethods, patchState, withComputed } from "@ngrx/signals";
import { Observable, pipe, tap, map, switchMap } from "rxjs";

import { NzNotificationService } from "ng-zorro-antd/notification";

import { Page } from "@pos/models";
import { PageParams } from "@pos/models";

export const CRUD_TABLE_STORE = new InjectionToken<ICrudTableStore<any>>('CRUD_TABLE_STORE');

export type CrudTableMetadata = {
  elementGender: 'f' | 'm';
  elementName: string;
  idField?: string;
  nameField?: string;
}

export type CrudTableState<T> = {
  currentPage: number;
  formEditMode: boolean;
  items: T[];
  loadingTable: boolean;
  loadingForm: boolean;
  modalTitle: string;
  modalVisible: boolean;
  orderBy: { [key: string]: string };
  pageSize: number;
  searchText: string;
  selectedItem: T | null;
  total: number;
  metadata: CrudTableMetadata;
}

export interface ICrudTableStore<T> {
  // State
  currentPage: () => number;
  elementName: () => string;
  elementSubject: () => string;
  formEditMode: () => boolean;
  items: () => T[];
  loadingTable: () => boolean;
  loadingForm: () => boolean;
  modalTitle: () => string;
  modalVisible: () => boolean;
  pageSize: () => number;
  searchText: () => string;
  selectedItem: () => T;
  total: () => number;
  // Methods
  create: (item: T) => Promise<T>;
  delete: (item: T) => Promise<void>;
  update: (item: T) => Promise<T>;
  getFormValue: (item: T, form: FormGroup) => T;
  getSortOrder: (key: string) => 'ascend' | 'descend' | null;
  hideModalForm: () => void;
  load: () => void;
  setCurrentPage: (page: number) => void;
  setMetadata: (metadata: CrudTableMetadata | undefined) => void;
  setOrderBy: (key: string, order: 'ascend' | 'descend' | null) => void;
  setPageSize: (size: number) => void;
  setSelectedItem: (item: T) => void;
  showModalForm: (title: string, item: T | null) => void;
}

const sortOrderDict: { [key: string]: string } = {
  'ascend': 'ASC',
  'descend': 'DESC',
};

export type SortOrder = string | null;

interface ICrudTableService<T> {
  create: (item: T) => Promise<T>;
  delete: (item: T) => Promise<void>;
  getFormValue: (item: T, form: FormGroup) => T;
  load: (pageParams: PageParams) => Observable<Page<T>>;
  update: (item: T) => Promise<T>;
}

export const withCrudTable = <T>(
  CrudTableService: ProviderToken<ICrudTableService<T>>,
) => {
  const initialState: CrudTableState<T> = {
    currentPage: 1,
    formEditMode: false,
    items: [],
    loadingTable: false,
    loadingForm: false,
    modalTitle: '',
    modalVisible: false,
    orderBy: {},
    pageSize: 20,
    searchText: '',
    selectedItem: null,
    total: 0,
    metadata: {
      elementGender: 'm',
      elementName: 'elemento'
    }
  }

  return signalStoreFeature(
    withState(initialState),
    withComputed((store) => ({
      totalPages: computed(() => Math.ceil(store.total() / store.pageSize())),
      hasNextPage: computed(() => store.currentPage() < Math.ceil(store.total() / store.pageSize())),
      hasPreviousPage: computed(() => store.currentPage() > 1),
      elementName: computed(() => store.metadata().elementName),
      elementSubject: computed(() => `${store.metadata().elementGender === 'm' ? 'el' : 'la'} ${store.metadata().elementName}`),
    })),
    withMethods(store => {
      const crudService = inject(CrudTableService);
      const notification = inject(NzNotificationService);

      return {
        getSortOrder: (key: string) => {
          return store.orderBy()[key] ?? null;
        },
        load: rxMethod<void>(
          pipe(
            // Start loading
            tap(() => patchState(store, { loadingTable: true })),
            // Build the page params object   
            map(() => {
              const offset = (store.currentPage() - 1) * store.pageSize();
              const orderBy = Object.entries(store.orderBy())
                .map(([key, value]) => `${key} ${sortOrderDict[value]}`)
                .join(', ');

              return {
                text: store.searchText(),
                limit: store.pageSize(),
                orderBy,
                offset
            }}),
            // Load the page
            switchMap((pageParams) => crudService.load(pageParams)),
            // Update the store
            tap((page) => patchState(store, { 
              items: page.items,
              total: page.total,
              loadingTable: false,
              // selectedItem: store.selectedItem() ? page.items.find(item => JSON.stringify(item) === JSON.stringify(store.selectedItem())) : null
            })),
          )
        ),
        setSearchText(searchText: string) {
          patchState(store, { searchText, currentPage: 1 });
          this.load();
        },
        setOrderBy(field: string, order: SortOrder) {
          let orderBy = { ...store.orderBy() };

          if (!order) {
            delete orderBy[field];
          } else if (order && order in sortOrderDict) {
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
        setCurrentPage(page: number) {
          if (page >= 1 && page <= store.totalPages()) {
            patchState(store, { currentPage: page });
          }
          this.load();
        },
        setSelectedItem(item: T) {
          patchState(store, { selectedItem: item });
        },
        setMetadata(metadata: CrudTableMetadata | undefined) {
          if (!metadata) {
            return;
          }
          patchState(store, { metadata });
        },
        nextPage() {
          if (store.currentPage() < store.totalPages()) {
            this.setCurrentPage(store.currentPage() + 1);
          }
          this.load();
        },
        previousPage() {
          if (store.currentPage() > 1) {
            this.setCurrentPage(store.currentPage() - 1);
          }
          this.load();
        },
        hideModalForm () {
          patchState(store, {
            modalVisible: false
          });
        },
        showModalForm (title: string, item: T | null) {
          patchState(store, {
            modalVisible: true,
            modalTitle: title,
            selectedItem: item,
            formEditMode: !!item,
          });
        },
        getFormValue (item: T, form: FormGroup) {
          return crudService.getFormValue(item, form);
        },
        async create (item: T) {
          if (store.loadingForm())
            return;

          patchState(store, {
            loadingForm: true,
          });

          try {
            await crudService.create(item);
            patchState(store, {
              modalVisible: false,
              loadingForm: false,
            });
            notification.create('success', `Nuevo ${store.metadata().elementName}`, `Se ha creado correctamente ${store.elementSubject()}`);
            this.load();
          } catch (error) {
            patchState(store, {
              loadingForm: false,
            });
          }
        },
        async update (item: T) {
          if (store.loadingForm())
            return;

          patchState(store, {
            loadingForm: true,
          });

          try {
            await crudService.update(item);
            patchState(store, {
              modalVisible: false,
              loadingForm: false,
            });
            notification.create('success', `Actualizar ${store.metadata().elementName}`, `Se ha actualizado correctamente ${store.elementSubject()}`);
            this.load();
          } catch (error) {
            patchState(store, {
              loadingForm: false,
            });
          }
        },
        async delete (item: T) {
          try {
            await crudService.delete(item);
            notification.create('success', `Eliminar ${store.metadata().elementName}`, `Se ha eliminado correctamente ${store.elementSubject()}`);
            this.load();
          } catch (error) {
            console.error(error);
            notification.create('error', `Eliminar ${store.metadata().elementName}`, `Error al eliminar ${store.elementSubject()}`);
          }
        }
      }
    })
  );
}