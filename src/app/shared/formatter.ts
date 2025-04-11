import { inject, Injectable, LOCALE_ID } from "@angular/core";
import { formatNumber } from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class Formatter {

  locale = inject(LOCALE_ID);

  constructor() {
    console.log(this.locale);
  }

  currency(value: any) {
    if (typeof value === 'number') {
      return `$${formatNumber(value, this.locale, '1.2-2')}`;
    }
    return value;
  }
}