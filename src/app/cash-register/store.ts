import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { Api } from '../api';
import { Product } from "../api/models"

export type LineItem = {
  product: Product
  quantity: number
  price: number
  total: number
}

type Sale = {
  searching: boolean
  searchText: string
  products: Product[]
  ticket: LineItem[]
}

const initialState: Sale = {
  searching: false,
  searchText: '',
  products: [] as Product[],
  ticket: [] as LineItem[]
}

export const CashRegisterStore = signalStore(
  { providedIn: 'root' },
  
  withState(initialState),

  withComputed((state) => ({
    // Total amount of the ticket
    total: computed(() => state.ticket().reduce((total, lineItem) => total + lineItem.total, 0)),

    // Search words from the search text
    searchWords: computed(() => state.searchText()
      .split(' ')
      .map((word) => word.trim())
      .filter((word) => word.length > 0)
    )
  })),

  withMethods((store, api = inject(Api)) => {
    // Helper methods
    // Find a line item by product id
    const findLineItem = (id: number) => store.ticket().find((lineItem) => lineItem.product.id === id)
    
    // Update an existing line item and return the updated ticket
    const updateLineItem = (ticket: LineItem[], product: Product, quantity: number) => 
      ticket.map((lineItem) =>
        lineItem.product.id === product.id
          ? {
              ...lineItem,
              quantity: quantity,
              total: quantity * lineItem.price,
            }
          : lineItem
      );

    // Add a new line item to the ticket and return the updated ticket
    const addLineItem = (ticket: LineItem[], product: Product) => [
      ...ticket,
      {
        product,
        quantity: 1,
        price: product.price,
        total: product.price,
      },
    ];

    // Store methods
    return {
      addLineItem(product: Product) {
        // Check if the product is already in the ticket
        const lineItem = findLineItem(product.id);

        // Get the updated ticket with a new line item or an updated line item quantity
        const updatedTicket = lineItem
          ? updateLineItem(store.ticket(), product, lineItem.quantity + 1)
          : addLineItem(store.ticket(), product);

        // Update the ticket 
        patchState(store, { ticket: updatedTicket });
      },

      clearTicket() {
        patchState(store, { ticket: [] });
      },

      removeLineItem(product: Product) {
        patchState(store, (state) => ({
          ticket: state.ticket.filter((lineItem) => lineItem.product.id !== product.id)
        }));
      },

      removeLastLineItem() {
        if (store.ticket().length == 0) {
          return;
        }
        patchState(store, (state) => ({
          ticket: state.ticket.slice(0, -1)
        }));
      },

      async searchProducts(searchText: string) {
        // Update the search text and set the searching flag
        patchState(store, { searchText, searching: !!searchText });

        // If the search text is empty, clear the products and return
        if (!searchText) {
          patchState(store, { products: [], searching: false });
          return;
        }

        // Fetch products from the API
        try {
          const products = await api.getProducts(searchText);
          patchState(store, { products, searching: false });
          
        } catch (error) {
          console.error('Error fetching products:', error);
          patchState(store, { searching: false });
        }
      },

      updateLineItem(product: Product, quantity: number) {
        // Get the updated ticket with the new quantity
        const updatedTicket = updateLineItem(store.ticket(), product, quantity);

        // Update the ticket
        patchState(store, { ticket: updatedTicket });
      }
    }
  })
);