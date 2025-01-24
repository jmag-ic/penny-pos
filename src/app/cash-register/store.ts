import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { ElectronApi } from '../api';
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
    total: computed(() => state.ticket().reduce((total, item) => total + item.total, 0)),
    searchWords: computed(() => state.searchText().split(' ').map(word => word.trim()))
  })),
  withMethods((store, api = inject(ElectronApi))=>({
    async searchProducts(searchText: string) {
      let products = [];

      if (searchText) {
        // Update the state with the search text and start the searching flag
        patchState(store, (state) => ({
          ...state,
          searchText,
          searching: true
        }));

        // Call the API to search for products
        products = await api.getProducts(searchText);
      }

      // Update the state with the search results and stop the searching flag
      patchState(store, (state) => ({
        ...state,
        products: products,
        searching: false,
      }));
    },

    async addProduct(product: Product) {
      // Find the product in the ticket
      const item = store.ticket().find((item) => item.product.id === product.id);

      // If the product is already in the ticket, update the quantity and total
      if (item) {
        patchState(store, (state) => ({
          ...state,
          ticket: state.ticket.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
              : item
          )
        }));

      } else {
        // If the product is not in the ticket, add it
        patchState(store, (state) => ({
          ...state,
          ticket: [
            ...state.ticket,
            {
              product,
              quantity: 1,
              price: product.price,
              total: product.price
            }
          ]
        }));
      }
    },

    async removeProduct(product: Product) {
      // Remove the product from the ticket
      patchState(store, (state) => ({
        ...state,
        ticket: state.ticket.filter((item) => item.product.id !== product.id)
      }));
    },
  }))
)