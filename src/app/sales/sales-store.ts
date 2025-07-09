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
    selectedRangeAmount: 0,
  }),
  withMethods((store) => {
    const api = inject(ApiService);
    const formatter = inject(Formatter);

    return {
      async setDateRange(range: [Date | null, Date | null] | null) {
        const state = { dateRange: range, filters: {}, displayFilters: {}, selectedRangeAmount: 0 };

        if (range && range[0] && range[1]) {

          // Set the filters for the API
          // The API expects the date to be in the format YYYY-MM-DD HH:MM:SS
          const start = getStrDateTime(range[0]);
          const end = getStrDateTime(datePlusDays(range[1], 1));

          state.filters = {
            saleDate: [{
                value: start,
                op: 'gte'
              }, {
                value: end,
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

          // Load total amount for selected range
          state.selectedRangeAmount = await api.getSalesAmount(start, end);
        } 

        patchState(store, state);
        store.load();
      },
      async loadTodaySalesAmount() {
        const todayDate = new Date();
        const today = getStrDateTime(todayDate);
        const tomorrow = getStrDateTime(datePlusDays(todayDate, 1));
        patchState(store, { todaySalesAmount: await api.getSalesAmount(today, tomorrow) });
      },
    }
  }),
  withHooks({
    onInit: (store) => {
      store.load();
      store.loadTodaySalesAmount();
    }
  })
);