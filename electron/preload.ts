import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use the ipcRenderer without exposing the entire object
// expose the repository object to allow the renderer process to interact with the database
contextBridge.exposeInMainWorld("repository", {
  // Items API
  getItems: (text: string, limit: number, offset: number) => {
    return ipcRenderer.invoke('getItems', {text, limit, offset});
  },

  // Sales API
  checkout: (items: any[], customerName: string, paymentMethod: string) => {
    return ipcRenderer.invoke('checkout', {items, customerName, paymentMethod});
  },
})