import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideNzI18n, es_ES } from 'ng-zorro-antd/i18n';
import { IconDefinition } from '@ant-design/icons-angular';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { DollarOutline, PlusOutline, SearchOutline, StockOutline } from '@ant-design/icons-angular/icons';

import { routes } from './app.routes';

const icons: IconDefinition[] = [DollarOutline,PlusOutline, SearchOutline, StockOutline];

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(BrowserAnimationsModule),
    provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
    provideNzIcons(icons),
    provideNzI18n(es_ES)
  ]
};
