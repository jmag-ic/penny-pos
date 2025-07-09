import { inject, Injectable, LOCALE_ID } from "@angular/core";
import { formatDate, formatNumber } from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class Formatter {

  locale = inject(LOCALE_ID);

  currency(value: any) {
    if (typeof value === 'number') {
      return `$${formatNumber(value, this.locale, '1.2-2')}`;
    }
    return value;
  }

  strToLocaleDate(strDate: string, format: string) {
    return this.toLocaleDate(new Date(strDate), format);
  }

  toLocaleDate(date: Date, format: string) {
    return formatDate(date, format, this.locale);
  }
}