import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';

import { Repository } from '../db/repository'
import { SqliteDb } from '../db/sqlite';

// Keep a global reference of the window object, if you don't, the window will
let mainWindow: BrowserWindow;

// createWindow method creates the main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 600,
    center: true,
    'minHeight': 600,
    'minWidth': 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const isDev = process.env['NODE_ENV'] === 'development';

  const startUrl = isDev
    ? 'http://localhost:4200'
    : url.format({
        pathname: path.join(__dirname, '/dist/angular-electron-boilerplate/index.html'),
        protocol: 'file:',
        slashes: true,
      });

  mainWindow.loadURL(startUrl);

  // on close event, dereference the window object
  mainWindow.on('closed', () => {
    mainWindow = null!;
  });
}

// on ready event, create the main window
app.on('ready', createWindow);

// on window all closed event, quit the app when all windows are closed
app.on('window-all-closed', () => {
  // On macOS it is common for applications to stay open until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// on activate event, re-create the main window when the app is activated
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC main handlers
const conn = new SqliteDb('./penny-pos.db');
const repo = new Repository(conn);

// Items API
ipcMain.handle('getItems', (_, {text, limit, offset}) => {
  return repo.getItems(text, limit, offset);
});

// Sales API
ipcMain.handle('checkout', (_, {items, customerName, paymentMethod}) => {
  return repo.checkout(items, customerName, paymentMethod);
});