import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideNzI18n, es_ES } from 'ng-zorro-antd/i18n';
import { IconDefinition } from '@ant-design/icons-angular';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
  DatabaseOutline,
  DollarOutline,
  ExportOutline,
  FilePdfOutline,
  FileExcelOutline,
  HomeOutline,
  ImportOutline,
  PlusOutline,
  SearchOutline,
  SettingOutline,
  ShoppingOutline,
  StockOutline,
  TagOutline,
  TeamOutline,
  TruckOutline,
  EditOutline,
  DeleteOutline,
  FilterOutline,
  SortAscendingOutline,
  SortDescendingOutline,
} from '@ant-design/icons-angular/icons';

import { routes } from './app.routes';

const icons: IconDefinition[] = [
  DatabaseOutline,
  DeleteOutline,
  DollarOutline,
  EditOutline,
  ExportOutline,
  FilePdfOutline,
  FileExcelOutline,
  FilterOutline,
  HomeOutline,
  ImportOutline,
  PlusOutline,
  SearchOutline,
  SettingOutline,
  ShoppingOutline,
  SortAscendingOutline,
  SortDescendingOutline,
  StockOutline,
  TagOutline,
  TeamOutline,
  TruckOutline,
];

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(BrowserAnimationsModule),
    provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
    provideNzIcons(icons),
    provideNzI18n(es_ES)
  ]
};
