import { Component, input, ViewEncapsulation } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'pos-form-item',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="form-item" [style.--label-span]="labelSpan()" [style.--control-span]="controlSpan()">
      <label class="form-label" [class.required]="required()">{{ label() }}</label>
      <div class="form-control">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .form-item {
      display: flex;
      margin-bottom: 1.5rem;
      --column-width: calc(100% / 24);
    }

    .form-label {
      flex: 0 0 calc(var(--label-span) * var(--column-width));
      padding-right: 1rem;
      text-align: right;
      line-height: 32px;
    }

    .form-control {
      flex: 0 0 calc(var(--control-span) * var(--column-width));
      position: relative;
    }

    .form-control .ng-invalid.ng-dirty, .form-control .ng-invalid.ng-touched {
      border-color: #ff4d4f;
    }

    .form-control .ng-invalid.ng-dirty:focus, .form-control .ng-invalid.ng-touched:focus {
      box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
    }

    .form-control .invalid-feedback {
      color: #ff4d4f;
      font-size: 12px;
      position: absolute;
      top: 100%;
      left: 0;
    }

    .required::after {
      content: '*';
      color: #ff4d4f;
    }
  `]
})
export class FormItem {
  label = input<string>();
  labelSpan = input<number>();
  controlSpan = input<number>();
  required = input<boolean>(false);
} 