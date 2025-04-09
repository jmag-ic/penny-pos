import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { iif, of, pipe, switchMap, tap } from 'rxjs';

import { NzNotificationService } from 'ng-zorro-antd/notification';

import { ProductEntity, SaleDTO, SaleItemEntity } from '@pos/models';
import { ApiService } from '../api';

export type LineItem = {
  product: ProductEntity;
  quantity: number;
  price: number;
  total: number;
};

export type Sale = {
  id: number;
  searching: boolean;
  searchText: string;
  products: ProductEntity[];
  ticket: LineItem[];
};

const emptySale: Sale = {
  id: 1,
  searching: false,
  searchText: '',
  products: [],
  ticket: []
};

type Sales = {
  sales: Sale[];
  currentIdx: number;
  currentSaleNumber: number;
  showCheckoutModal: boolean;
};

const initialState: Sales = {
  sales: [emptySale],  // Start with one empty sale
  currentIdx: 0,
  currentSaleNumber: 1,
  showCheckoutModal: false
};

export const SalesStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((store) => ({
    // The currently selected sale
    currentSale: computed(() => {
      const idx = store.currentIdx();
      return store.sales()[idx];
    }),

    // Convenience: total amount of the currently selected sale
    total: computed(() => {
      const sale = store.sales()[store.currentIdx()];
      return sale.ticket.reduce((sum, lineItem) => sum + lineItem.total, 0);
    }),

    // Convenience: search words derived from the selected sale's searchText
    searchWords: computed(() => {
      const sale = store.sales()[store.currentIdx()];
      return sale.searchText
        .split(' ')
        .map((word) => word.trim())
        .filter((word) => word.length > 0);
    }),

    // The last valid index of the sales array
    lastIdx: computed(() => store.sales().length - 1)
  })),

  // Methods that mutate the store state
  withMethods((store, api = inject(ApiService), notification = inject(NzNotificationService)) => {
    /**
     * Helper: Update the currently selected sale.
     * We get the old sale, transform it, and produce a new sale object,
     * then patch `store.sales` accordingly.
     */
    function updateCurrentSale(updater: (oldSale: Sale) => Sale) {
      patchState(store, (state) => {
        const { sales, currentIdx: selectedIdx } = state;
        const updatedSales = sales.map((sale, idx) =>
          idx === selectedIdx ? updater(sale) : sale
        );
        return { sales: updatedSales };
      });
    }

    // Utility: find a line item by product ID
    function findLineItem(sale: Sale, productId: number) {
      return sale.ticket.find((item) => item.product.id === productId);
    }

    // Utility: update an existing line item's quantity
    function updateLineItem(sale: Sale, product: ProductEntity, quantity: number) {
      return sale.ticket.map((lineItem) =>
        lineItem.product.id === product.id
          ? {
              ...lineItem,
              quantity,
              total: quantity * lineItem.price,
            }
          : lineItem
      );
    }

    // Utility: add a new line item and return the updated ticket
    function addNewLineItem(sale: Sale, product: ProductEntity) {
      return [
        ...sale.ticket,
        {
          product,
          quantity: 1,
          price: product.price,
          total: product.price
        }
      ];
    }

    return {
      // Methods that manage the sales array
      addSale() {
        // Limit the number of open sales to, e.g., 8
        if (store.lastIdx() >= 8) {
          return;
        }

        const nextSaleNumber = store.currentSaleNumber() + 1;
        const newSale: Sale = {
          ...emptySale,
          id: nextSaleNumber
        };

        patchState(store, (state) => ({
          sales: [...state.sales, newSale],
          currentSaleNumber: nextSaleNumber
        }));

        // Select the newly added sale
        this.setCurrentSale(store.lastIdx());
      },

      removeSale(index: number) {
        // If there's only one sale left, reset it
        if (store.sales().length <= 1) {
          patchState(store, {
            sales: [emptySale],
            currentIdx: 0,
            currentSaleNumber: 1
          });
          return;
        }

        // Adjust the selected index if needed
        let newSelectedIdx = store.currentIdx();
        if (index === newSelectedIdx && index > 0) {
          newSelectedIdx--;
        }

        patchState(store, (state) => ({
          sales: state.sales.filter((_, i) => i !== index),
          currentIdx: newSelectedIdx
        }));
      },

      setCurrentSale(index: number) {
        if (index < 0 || index > store.lastIdx()) {
          return;
        }
        patchState(store, { currentIdx: index });
      },

      setShowCheckoutModal(show: boolean) {
        // If the user tries to open the checkout modal with an empty ticket, don't do anything
        if (show && store.currentSale().ticket.length === 0) {
          return;
        }

        patchState(store, { 
          showCheckoutModal: show
        });
      },

      // Methods that manage the current sale
      addLineItem(product: ProductEntity) {
        updateCurrentSale((sale) => {
          const lineItem = findLineItem(sale, product.id);
          return lineItem
            ? {
                ...sale,
                searchText: '',
                products: [],
                ticket: updateLineItem(sale, product, lineItem.quantity + 1)
              }
            : {
                ...sale,
                searchText: '',
                products: [],
                ticket: addNewLineItem(sale, product)
              };
        });
      },

      removeLineItem(product: ProductEntity) {
        updateCurrentSale((sale) => ({
          ...sale,
          ticket: sale.ticket.filter((item) => item.product.id !== product.id)
        }));
      },

      removeLastLineItem() {
        updateCurrentSale((sale) => {
          if (sale.ticket.length === 0) return sale;
          return {
            ...sale,
            ticket: sale.ticket.slice(0, -1)
          };
        });
      },

      async checkout(paymentAmount: number) {
        try {
          const saleDTO: Partial<SaleDTO> = {
            items: store.currentSale().ticket.map(ticketItem => ({
              itemId: ticketItem.product.id,
              quantity: ticketItem.quantity,
            } as SaleItemEntity)),
            paymentAmount,
            customerName: 'Público en general',
            paymentMethod: 'Efectivo'
          };
          // Perform the checkout operation
          await api.checkout(saleDTO);
          
          // Close the checkout modal
          this.setShowCheckoutModal(false);
          
          // Remove the current sale and add a new one if needed
          this.removeSale(store.currentIdx());
          if (store.sales().length === 0) {
            this.addSale();
          }
          
          // Show a success 
          notification.create('success', 'Caja registradora', `Venta realizada correctamente`);
        } catch (error) {
          console.error('Error checking out:', error);
          notification.create('error', 'Caja registradora', 'Error al realizar la venta');
        }
      },

      clearTicket() {
        updateCurrentSale((sale) => ({
          ...sale,
          ticket: []
        }));
      },

      resetSale() {
        // Replace the currently selected sale with a fresh emptySale
        updateCurrentSale(() => ({...emptySale}));
      },
      
      searchProducts: rxMethod<string>(
        pipe(
          tap(searchText => updateCurrentSale((sale) => ({
            ...sale,
            searching: true,
            searchText: searchText,
          }))),
          switchMap(searchText => iif(
            () => !!searchText,
            // If the search text is not empty, fetch the products from the API
            api.searchProducts({
              text: searchText,
              orderBy: 'name'
            }),
            // If the search text is empty, return an empty page
            of({items: [], total: 0}),
          )),
          // Update the currently selected sale with the fetched products
          tap(page => updateCurrentSale((sale) => ({
            ...sale,
            products: page.items,
            searching: false,
          })))
        )
      ),

      updateLineItem(product: ProductEntity, quantity: number) {
        updateCurrentSale((sale) => ({
          ...sale,
          ticket: updateLineItem(sale, product, quantity)
        }));
      }
    };
  })
);