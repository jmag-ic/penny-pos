import { AfterViewInit, Component, HostListener, inject, ViewChild } from "@angular/core";

import { NzGridModule } from "ng-zorro-antd/grid";
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from "ng-zorro-antd/tabs"
import { CtrlCommander } from "../shared/ctrl-commander";

import { ProductFinder } from "./product-finder";
import { Ticket } from "./ticket";
import { PaymentModal } from "./payment-modal";

import { SalesStore } from "./cash-register-state";

@Component({
  selector: "pos-cash-register",
  imports: [NzGridModule, NzTableModule, NzTabsModule, ProductFinder, Ticket, PaymentModal],
  template: `
    <nz-tabset
      [nzSelectedIndex]="store.currentIdx()"
      nzType="editable-card"
      (nzAdd)="addSale()"
      (nzClose)="removeSale($event.index)"
    >
      @for(sale of store.sales(); let idx = $index; track idx){
        <nz-tab [nzTitle]="'Venta ' + sale.id" [nzClosable]="store.lastIdx()>0" (nzSelect)="selectSale(idx)"/>
      }
    </nz-tabset>
    <div nz-row>
      <div nz-col nzSpan="9" class="pr-3">
        <pos-product-finder />
      </div>
      <div nz-col nzSpan="15">
        <pos-ticket/>
      </div>
    </div>
    <pos-payment-modal />
  `,
})
export class CashRegister extends CtrlCommander implements AfterViewInit {

  @ViewChild(ProductFinder)
  protected productFinder!: ProductFinder;
  
  // Implement the handleKeyDownEvent method from the Controlable class
  // to handle the keydown event
  @HostListener("document:keydown", ["$event"])
  protected handleKeyDownEvent(event: KeyboardEvent) {
    this.handleCtrlCommands(event);
  }

  // Inject the store
  protected readonly store = inject(SalesStore);

  constructor() {
    super({
      'b': () => this.productFinder.focusSearchInput(),
      'd': () => this.removeLastLineItem(),
      'n': () => this.addSale(),
      'w': () => this.removeSale(this.store.currentIdx()),
      'digit': ({key}) => this.selectSale(+key-1),
      'enter': () => this.store.setShowCheckoutModal(true)
    });
  }

  ngAfterViewInit(): void {
    this.productFinder.focusSearchInput();
  }

  protected addSale() {
    this.store.addSale();
    this.productFinder.focusSearchInput();
  }

  protected removeSale(idx: number) {
    this.store.removeSale(idx);
    this.productFinder.focusSearchInput();
  }

  protected removeLastLineItem() {
    this.store.removeLastLineItem();
    this.productFinder.focusSearchInput();
  }

  protected selectSale(idx: number) {
    this.store.setCurrentSale(idx);
    this.productFinder.focusSearchInput();
  }
}