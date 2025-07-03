import { signalStore, withHooks, withState, patchState, withComputed, withMethods } from "@ngrx/signals";
import { SaleEntity, SaleDTO, Filter } from "@pos/models";

import { SalesService } from "./sales-service";
import { withCrudTable } from "../shared/with-crud-table";
import { inject } from "@angular/core";
import { ApiService } from "../api";
import { datePlusDays, formatDate } from "@pos/utils/dates";

export const SalesStore = signalStore(
  { providedIn: 'root' },
  withCrudTable<SaleEntity, SaleDTO>(SalesService),
  withState({
    dateRange: null as [Date | null, Date | null] | null,
    todaySalesAmount: 0,
  }),
  withMethods((store) => {
    const api = inject(ApiService);

    return {
      setDateRange(range: [Date | null, Date | null] | null) {
        const state = { dateRange: range, filters: {} };

        if (range && range[0] && range[1]) {
          const startDate = formatDate(range[0]);
          const endDate = formatDate(datePlusDays(range[1], 1));
          state.filters = {
            saleDate: [{
                value: startDate,
                op: 'gte'
              }, {
                value: endDate,
                op: 'lt'
            }]
          };
        } 

        patchState(store, state);
        store.load();
      },
      async loadTodaySalesAmount() {
        const today = formatDate(new Date());
        const tomorrow = formatDate(datePlusDays(new Date(), 1));
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