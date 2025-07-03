import { ipcRenderer } from "electron";
import { contextBridge } from "electron";

import { PageParams, ProductEntity, SaleDTO, SaleEntity } from "../models";

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
  },

  searchSales: (pageParams: PageParams<SaleEntity>) => {
    return ipcRenderer.invoke('searchSales', pageParams);
  },

  deleteSale: (id: number) => {
    return ipcRenderer.invoke('deleteSale', id);
  },

  getSalesAmount: (startDate: string, endDate: string) => {
    return ipcRenderer.invoke('getSalesAmount', startDate, endDate);
  }
}

// Expose protected methods that allow the renderer process to use the ipcRenderer without exposing the entire object
// expose the api object to allow the renderer process to interact with the database
contextBridge.exposeInMainWorld("api", api);