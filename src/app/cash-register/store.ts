import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { Api } from '../api';
import { Product } from "../api/models"

type TicketItem = {
  product: Product
  quantity: number
  price: number
  total: number
}

type CashRegisterState = {
  searching: boolean
  searchText: string
  products: Product[]
  ticket: TicketItem[]
}

const initialState: CashRegisterState = {
  searching: false,
  searchText: '',
  products: [] as Product[],
  ticket: [] as TicketItem[]
}

export const CashRegisterStore = signalStore(
  { providedIn: 'root' },
  
  withState(initialState),

  withComputed((state) => ({
    // Total amount of the ticket
    total: computed(() => state.ticket().reduce((total, item) => total + item.total, 0)),

    // Search words from the search text
    searchWords: computed(() => state.searchText()
      .split(' ')
      .map((word) => word.trim())
      .filter((word) => word.length > 0)
    )
  })),

  withMethods((store, api = inject(Api)) => {
    // Helper methods
    // Find a ticket item by product id
    const findTicketItem = (id: number) => store.ticket().find((item) => item.product.id === id)
    
    // Update an existing item in the ticket
    const updateTicketItem = (ticket: TicketItem[], product: Product, quantity: number) => 
      ticket.map((item) =>
        item.product.id === product.id
          ? {
              ...item,
              quantity: quantity,
              total: quantity * item.price,
            }
          : item
      );

    // Add a new item to the ticket
    const addTicketItem = (ticket: TicketItem[], product: Product) => [
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
      addTicketItem(product: Product) {
        // Check if the product is already in the ticket
        const existingItem = findTicketItem(product.id);

        // Get the updated ticket with a new item or an updated item quantity
        const updatedTicket = existingItem
          ? updateTicketItem(store.ticket(), product, existingItem.quantity + 1)
          : addTicketItem(store.ticket(), product);

        // Update the ticket 
        patchState(store, { ticket: updatedTicket });
      },

      clearTicket() {
        patchState(store, { ticket: [] });
      },

      removeTicketItem(product: Product) {
        patchState(store, (state) => ({
          ticket: state.ticket.filter((item) => item.product.id !== product.id)
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

      updateTicketItem(product: Product, quantity: number) {
        // Get the updated ticket with the new quantity
        const updatedTicket = updateTicketItem(store.ticket(), product, quantity);

        // Update the ticket
        patchState(store, { ticket: updatedTicket });
      }
    }
  })
);