import { computed, inject, ProviderToken } from '@angular/core';
import { patchState, signalStoreFeature, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { map, Observable, pipe, switchMap, tap } from 'rxjs';

import { Page, PageParams } from '@pos/models';

const sortOrderDict: { [key: string]: string } = {
  'ascend': 'ASC',
  'descend': 'DESC',
};

export type SortOrder = string | null;
export interface IPaginationStore {
  items: () => any[];
  currentPage: () => number;
  pageSize: () => number;
  total: () => number;
  loading: () => boolean;
  orderBy: () => { [key: string]: string };
  getSortOrder: (key: string) => SortOrder;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setOrderBy: (field: string, order: SortOrder) => void;
  totalPages: () => number;
}

export type PaginationState<T> = {
  searchText: string;
  items: T[];
  currentPage: number;
  pageSize: number;
  total: number;
  loading: boolean;
  orderBy: { [key: string]: string };
};

export const withPagination = <T>(Loader: ProviderToken<{
  load: (
    pageParams: PageParams,
  ) => Observable<Page<T>>;
}>) => {

  const initialState: PaginationState<T> = {
    searchText: '',
    items: [],
    currentPage: 1,
    pageSize: 20,
    total: 0,
    loading: false,
    orderBy: {}
  };

  return signalStoreFeature(
    withState(initialState),
    withComputed((store) => ({
      totalPages: computed(() => Math.ceil(store.total() / store.pageSize())),
      hasNextPage: computed(() => store.currentPage() < Math.ceil(store.total() / store.pageSize())),
      hasPreviousPage: computed(() => store.currentPage() > 1),
    })),
    withMethods((store) => {
      const loader = inject(Loader);
      return {
        getSortOrder: (key: string) => {
          return store.orderBy()[key] ?? null;
        },
        load: rxMethod<void>(
          pipe(
            // Start loading
            tap(() => patchState(store, { loading: true })),
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
            switchMap((pageParams) => loader.load(pageParams)),
            // Update the store
            tap((page) => patchState(store, { 
              items: page.items,
              total: page.total,
              loading: false
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
        }
      }
    })
  );
}; 