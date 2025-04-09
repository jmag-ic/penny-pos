import { ipcRenderer } from "electron";
import { contextBridge } from "electron";

import { PageParams, ProductEntity, SaleDTO } from "../models";

import { IAPI } from "./api";

const api: IAPI = {
  createItem: (item: ProductEntity) => {
    return ipcRenderer.invoke('createItem', {item});
  },
  updateItem: (item: ProductEntity) => {
    return ipcRenderer.invoke('updateItem', {item});
  },
  deleteItem: (id: number) => {
    return ipcRenderer.invoke('deleteItem', {id});
  },
  
  searchItems: (pageParams: PageParams) => {
    return ipcRenderer.invoke('searchItems', { pageParams });
  },
  
  checkout: (saleDTO: Partial<SaleDTO>) => {
    return ipcRenderer.invoke('checkout', saleDTO);
  },

  getCategories: () => {
    return ipcRenderer.invoke('getCategories');
  }
}

// Expose protected methods that allow the renderer process to use the ipcRenderer without exposing the entire object
// expose the api object to allow the renderer process to interact with the database
contextBridge.exposeInMainWorld("api", api);