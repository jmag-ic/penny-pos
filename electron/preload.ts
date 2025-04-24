import { ipcRenderer } from "electron";
import { contextBridge } from "electron";

import { PageParams, ProductEntity, SaleDTO } from "../models";

import { IAPI } from "../api";

const api: IAPI = {
  createProduct: (product: ProductEntity) => {
    return ipcRenderer.invoke('createProduct', product);
  },

  updateProduct: (product: ProductEntity) => {
    return ipcRenderer.invoke('updateProduct', product);
  },

  deleteProduct: (id: number) => { 
    return ipcRenderer.invoke('deleteProduct', id);
  },
  
  searchProducts: (pageParams: PageParams<ProductEntity>) => {
    return ipcRenderer.invoke('searchProducts', pageParams);
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