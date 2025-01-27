import { Component, HostListener, inject, ViewChild } from "@angular/core";

import { NzGridModule } from "ng-zorro-antd/grid";
import { NzTableModule } from 'ng-zorro-antd/table';

import { CtrlCommander } from "../shared/ctrl-commander";

import { ProductFinder } from "./product-finder";
import { Ticket } from "./ticket";

import { CashRegisterStore } from "./store";


@Component({
  selector: "pos-cash-register",
  imports: [NzGridModule, NzTableModule, ProductFinder, Ticket],
  template: `
    <div nz-row>
      <div nz-col nzSpan="9">
        <pos-product-finder/>
      </div>
      <div nz-col nzSpan="15">
        <pos-ticket/>
      </div>
    </div>
  `
})
export class CashRegister extends CtrlCommander {

  @ViewChild(ProductFinder)
  protected productFinder!: ProductFinder;
  
  // Implement the handleKeyDownEvent method from the Controlable class
  // to handle the keydown event
  @HostListener("document:keydown", ["$event"])
  protected handleKeyDownEvent(event: KeyboardEvent) {
    this.handleCtrlCommands(event);
  }

  // Inject the cash register store
  protected readonly store = inject(CashRegisterStore);

  constructor() {
    super({
      'b': () => this.productFinder.focusSearchInput(),
      'd': () => this.store.removeLastLineItem(),
    });
  } 
}