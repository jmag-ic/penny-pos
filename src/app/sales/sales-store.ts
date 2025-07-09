import { signalStore, withHooks, withState, patchState, withComputed, withMethods } from "@ngrx/signals";
import { SaleEntity, SaleDTO } from "@pos/models";

import { SalesService } from "./sales-service";
import { withCrudTable } from "../shared/with-crud-table";
import { inject } from "@angular/core";
import { ApiService } from "../api";
import { datePlusDays, getStrDateTime } from "@pos/utils/dates";
import { Formatter } from "../shared/formatter";

export const SalesStore = signalStore(
  { providedIn: 'root' },
  withCrudTable<SaleEntity, SaleDTO>(SalesService),
  withState({
    dateRange: null as [Date | null, Date | null] | null,
    todaySalesAmount: 0,
  }),
  withMethods((store) => {
    const api = inject(ApiService);
    const formatter = inject(Formatter);

    return {
      setDateRange(range: [Date | null, Date | null] | null) {
        const state = { dateRange: range, filters: {}, displayFilters: {} };

        if (range && range[0] && range[1]) {

          // Set the filters for the API
          // The API expects the date to be in the format YYYY-MM-DD HH:MM:SS
          state.filters = {
            saleDate: [{
                value: getStrDateTime(range[0]),
                op: 'gte'
              }, {
                value: getStrDateTime(datePlusDays(range[1], 1)),
                op: 'lt'
            }]
          };

          // Set the filters for the UI
          // The UI expects the locale date in format dd/MM/yyyy
          state.displayFilters = {
            saleDate: [{
              value: formatter.toLocaleDate(range[0], 'dd-MMM-yyyy'),
              op: 'gte'
            }, {
              value: formatter.toLocaleDate(range[1], 'dd-MMM-yyyy'),
              op: 'lt'
            }]
          }
        } 

        patchState(store, state);
        store.load();
      },
      async loadTodaySalesAmount() {
        const today = getStrDateTime(new Date());
        const tomorrow = getStrDateTime(datePlusDays(new Date(), 1));
        const todaySalesAmount = await api.getSalesAmount(today, tomorrow);
        patchState(store, { todaySalesAmount });
      }
    }
  }),
  withHooks({
    onInit: (store) => {
      store.load();
      store.loadTodaySalesAmount();
    }
  })
);