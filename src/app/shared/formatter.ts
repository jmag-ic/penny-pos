import { inject, Injectable } from "@angular/core";
import { DecimalPipe } from "@angular/common";

@Injectable({
  providedIn: 'root',
})
export class Formatter {
  decimalPipe = inject(DecimalPipe);

  currency(value: any) {
    if (typeof value === 'number') {
      return this.decimalPipe.transform(value / 100, '1.2-2');
    }
    return value;
  }
}