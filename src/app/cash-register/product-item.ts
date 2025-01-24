import { Component, ElementRef, Input, ViewChild, ViewChildren } from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { Highlightable } from "@angular/cdk/a11y";

import { NzListModule } from "ng-zorro-antd/list";
import { NzTagModule } from "ng-zorro-antd/tag";
import { NzIconModule } from "ng-zorro-antd/icon";

import { HighlightTextPipe } from "../shared/highlight-words-pipe";
import { Product } from "../api/model";

@Component({
  imports: [NzIconModule, NzListModule, NzTagModule, DecimalPipe, HighlightTextPipe],
  selector: 'pos-product-item',
  template: `
    <div #itemRef>
      <nz-list-item [class.disabled]="disabled" [class.active]="isActive">
        <span [innerHTML]="item.name | highlightText: highligthWords"></span>
          <div class="stats">
            <nz-tag class="price" nzColor="green">
              <div class="tag-content">
                <span nz-icon nzType="dollar"></span>
                <span>{{ item.price/100 | number:'1.2-2' }}</span>
              </div>
            </nz-tag>
            <nz-tag class="stock" [nzColor]="item.stock !== null ? (item.stock > 10 ? 'blue' : (item.stock > 0 ? 'gold' : 'red')) : 'default'">
              <div class="tag-content">
                <span nz-icon nzType="stock"></span>
                {{item.stock !== null ? item.stock : '∞'}}
              </div>
            </nz-tag>
          </div>
      </nz-list-item>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      border-bottom: 1px solid #f0f0f0;
    }

    :host:last-child {
      border-bottom: none;
    }

    div.tag-content {
      display: flex;
      justify-content: space-between;
    }

    div.stats {
      display: flex;
      flex-direction: column;
    }
  
    nz-tag.price {
      min-width: 5rem;
    }
  
    nz-tag.stock {
      min-width: 3.5rem;
    }
  
    [nzType="dollar-o"] {
      color: #52c41a;
    }

    .active  {
      background-color: #1890ff;
      color: #fff;
    }
    
    .disabled {
      opacity: 0.4;
    }
  `]
})
export class ProductItem implements Highlightable {
  // Inputs
  @Input() item!: Product;
  @Input() disabled?: boolean | undefined;
  @Input() highligthWords!: string[];

  // Template references
  @ViewChild('itemRef') itemRef!: ElementRef;

  // Component state
  private _isActive: boolean = false;

  // Getters
  get isActive() {
    return this._isActive;
  }

  // setActiveStyles and setInactiveStyles are implemented from the Highlightable interface
  // They are used to set the active and inactive styles of the item
  setActiveStyles() {
    this._isActive = true;
    this.scrollIntoView();
  }

  setInactiveStyles() {
    this._isActive = false;
  }

  // getLabel is implemented from the Highlightable interface
  getLabel() {
    return this.item.name;
  }

  // scrollIntoView is a helper method to scroll the item into
  private scrollIntoView(): void {
    this.itemRef.nativeElement.scrollIntoView({ block: 'nearest' });
  }
}