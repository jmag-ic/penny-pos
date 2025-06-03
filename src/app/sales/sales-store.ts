import { signalStore, withHooks, withState, patchState, withComputed, withMethods } from "@ngrx/signals";
import { SaleEntity, SaleDTO, Filter } from "@pos/models";

import { SalesService } from "./sales-service";
import { withCrudTable } from "../shared/with-crud-table";

export const SalesStore = signalStore(
  { providedIn: 'root' },
  withCrudTable<SaleEntity, SaleDTO>(SalesService),
  withState({
    dateRange: null as [Date | null, Date | null] | null,
  }),
  withMethods((store) => ({
    setDateRange(range: [Date | null, Date | null] | null) {
      const state = { dateRange: range, filters: {} };

      if (range && range[0] && range[1]) {
        // Set date range filter with multiple conditions
        state.filters = {
          saleDate: [
            {
              // format date to yyyy-mm-dd
              value: range[0].toISOString().split('T')[0],
              op: 'gte'
            },
            {
              // Add one day to include the entire end date
              value: new Date(range[1]?.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              op: 'lt'
            }
          ]
        };
      } 

      patchState(store, state);
      console.log("state", state);
      store.load();
    }
  })),
  withHooks({
    onInit: (store) => {
      store.load();
    }
  })
);
