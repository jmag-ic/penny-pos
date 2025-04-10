import { Component, inject, signal, ViewChild, ElementRef } from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { FormsModule } from '@angular/forms';

import { NzInputModule } from "ng-zorro-antd/input";
import { NzModalModule } from 'ng-zorro-antd/modal';

import { SalesStore } from "./cash-register-store";

@Component({
  selector: "pos-payment-modal",
  standalone: true,
  imports: [FormsModule, DecimalPipe, NzInputModule, NzModalModule],
  template: `
    <nz-modal 
      [nzVisible]="store.showCheckoutModal()" 
      nzTitle="Cobrar venta" 
      nzWidth="350px"
      (nzOnCancel)="store.setShowCheckoutModal(false)" 
      (nzOnOk)="store.checkout(this.paymentAmount())"
      [nzOkText]="'Aceptar'"
      [nzCancelText]="'Cancelar'"
      [nzOkDisabled]="paymentAmount() < store.total()"
      (nzAfterOpen)="focusInput()"
    >
      <ng-container *nzModalContent>
        <div class= "payment-item text-lg">
          <span>Total: </span>
          <span>\${{ store.total() | number:'1.2-2' }}</span>
        </div>
        <div class="payment-item">
          <span class="text-lg" style="width: 400px;">Cantidad recibida:</span>
          <nz-input-group nzAddOnBefore="$">
            <input nz-input
              #paymentInput
              type="number"
              [ngModel]="paymentAmount()"
              (input)="onPaymentAmountChange($event)"
              (keyup.enter)="onPaymentAmountEnter()"
              nzSize="large"
            />
          </nz-input-group>
        </div>
        <div class="payment-item text-lg font-bold">
          <span>Cambio: </span>
          <span>\${{ (paymentAmount() > store.total() ? (paymentAmount() - store.total()) : 0) | number:'1.2-2' }}</span>
        </div>
        
      </ng-container>
    </nz-modal>
  `,
  styles: `
    .payment-item {
      padding: 0.5rem;
      display: flex;
      justify-content: space-between;
    }
    input[type="number"] {
      text-align: right;
      font-size: 1.125rem;
    }
  `
})
export class PaymentModal {
  protected readonly store = inject(SalesStore);
  protected paymentAmount = signal<number>(0);
  
  @ViewChild('paymentInput') paymentInput!: ElementRef;

  protected focusInput() {
    this.paymentAmount.set(this.store.total());

    setTimeout(() => {
      this.paymentInput.nativeElement.focus();
      this.paymentInput.nativeElement.select();
    });
  }

  protected onPaymentAmountChange(event: any) {
    const value = event.target.value;
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) {
      return;
    }

    this.paymentAmount.set(parsedValue);
  }

  protected onPaymentAmountEnter() {
    this.store.checkout(this.paymentAmount());
  }
} 