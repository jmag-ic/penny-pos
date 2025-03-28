import { ipcRenderer } from "electron";
import { contextBridge } from "electron";
import { IAPI } from "./api";
import { PageParams } from "../models";

export const api: IAPI = {
  searchItems: (pageParams: PageParams) => {
    return ipcRenderer.invoke('searchItems', {pageParams});
  },
  checkout: (items: any[], paymentAmount: number, customerName: string, paymentMethod: string) => {
    return ipcRenderer.invoke('checkout', {items, paymentAmount, customerName, paymentMethod});
  },
}

// Expose protected methods that allow the renderer process to use the ipcRenderer without exposing the entire object
// expose the api object to allow the renderer process to interact with the database
contextBridge.exposeInMainWorld("api", api);