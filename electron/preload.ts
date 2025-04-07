import { ipcRenderer } from "electron";
import { contextBridge } from "electron";

import { IAPI } from "./api";
import { PageParams, Product } from "../models";

export const api: IAPI = {
  createItem: (item: Product) => {
    return ipcRenderer.invoke('createItem', {item});
  },
  updateItem: (item: Product) => {
    return ipcRenderer.invoke('updateItem', {item});
  },
  deleteItem: (item: Product) => {
    return ipcRenderer.invoke('deleteItem', {item});
  },
  
  searchItems: (pageParams: PageParams) => {
    return ipcRenderer.invoke('searchItems', { pageParams });
  },
  
  checkout: (items: any[], paymentAmount: number, customerName: string, paymentMethod: string) => {
    return ipcRenderer.invoke('checkout', {items, paymentAmount, customerName, paymentMethod});
  },

  getCategories: () => {
    return ipcRenderer.invoke('getCategories');
  }
}

// Expose protected methods that allow the renderer process to use the ipcRenderer without exposing the entire object
// expose the api object to allow the renderer process to interact with the database
contextBridge.exposeInMainWorld("api", api);