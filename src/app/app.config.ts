import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideNzI18n, es_ES } from 'ng-zorro-antd/i18n';
import { IconDefinition } from '@ant-design/icons-angular';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { SearchOutline, DollarOutline, StockOutline } from '@ant-design/icons-angular/icons';

import { routes } from './app.routes';

const icons: IconDefinition[] = [SearchOutline, DollarOutline, StockOutline];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
    provideNzIcons(icons),
    provideNzI18n(es_ES)
  ]
};
