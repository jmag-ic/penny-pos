import { Component, computed, ElementRef, inject, input, QueryList, ViewChildren, output, signal } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzModalModule } from "ng-zorro-antd/modal";
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

import { ValdemortModule } from 'ngx-valdemort';

import { IModalFormStore, MODAL_FORM_STORE } from "./with-crud-modal-form";
import { CaseTransform, InputAlphanumericDirective } from "./input-alphanumeric";
import { FormItem } from "./form-item";

export type ControlOption = {
  label: string,
  value: any,
}

export type FormModalConfig = {
  [key: string]: {
    control: any,
    controlSpan?: number,
    label: string, 
    labelSpan?: number,
    alphanumeric?: {
      case?: CaseTransform,
    },
    options?: ControlOption[],
    type: string | 'text' | 'number' | 'select' | 'date' | 'switch' | 'autocomplete',
    transform?: (value: any) => any,
  } 
}

@Component({
  selector: 'pos-form-modal',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzAutocompleteModule,
    NzDatePickerModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzSpinModule,
    NzSwitchModule,
    ValdemortModule,
    InputAlphanumericDirective,
    FormItem
  ],
  template: `
    <nz-modal
      [nzCentered]="true"
      [nzMaskClosable]="false"
      [nzBodyStyle]="{ 'max-height': '65vh', 'overflow-y': 'auto' }"
      [nzVisible]="store.modalVisible()" 
      [nzTitle]="store.modalTitle()"
      [nzOkText]="'Aceptar'"
      [nzCancelText]="'Cancelar'"
      (nzOnOk)="onOk()"
      (nzOnCancel)="onCancel()"
      (nzAfterOpen)="afterOpen()"
      (nzAfterClose)="afterClose()"
    >
      <ng-container *nzModalContent>
        <nz-spin [nzSpinning]="store.loadingForm()">
          <form nz-form [formGroup]="formGroup()" (ngSubmit)="onOk()">
            @for (fieldName of formKeys(); track fieldName) {
              @let field = config()[fieldName];
              <pos-form-item
                [label]="field.label"
                [labelSpan]="field.labelSpan ?? 5"
                [controlSpan]="field.controlSpan ?? 19"
                [required]="requiredFields().includes(fieldName)"
              >
                @switch (field.type) {
                  @case ('string') {
                    <input #inputs nz-input
                      [formControlName]="fieldName"
                      [inputAlphanumeric]="!!field.alphanumeric"
                      [case]="field.alphanumeric?.case ?? 'none'"
                    />
                  }
                  @case ('text') {
                    <textarea #inputs nz-input
                      [formControlName]="fieldName"
                      [inputAlphanumeric]="!!field.alphanumeric"
                      [case]="field.alphanumeric?.case ?? 'none'"
                    ></textarea>
                  }
                  @case ('number') {
                    <input #inputs type="number" nz-input [formControlName]="fieldName" />
                  }
                  @case ('select') {
                    <nz-select #inputs nzShowSearch nzAllowClear [formControlName]="fieldName">
                      @for (option of config()[fieldName].options; track option.value) {
                        <nz-option [nzValue]="option.value" [nzLabel]="option.label" />
                      }
                    </nz-select>
                  }
                  @case ('date') {
                    <nz-date-picker #inputs [formControlName]="fieldName" [nzFormat]="'dd-MMM-yyyy'" [nzAllowClear]="false" />
                  }
                  @case ('switch') {
                    <nz-switch #inputs [formControlName]="fieldName" />
                  }
                  @case ('autocomplete') {
                    <input #inputs
                      nz-input
                      [nzAutocomplete]="auto"
                      [formControlName]="fieldName"
                      [inputAlphanumeric]="!!field.alphanumeric"
                      [case]="field.alphanumeric?.case ?? 'none'"
                      (ngModelChange)="updateAutocompleteOptions(fieldName, $event)"
                    />
                    <nz-autocomplete #auto [compareWith]="compareFun">
                      @for (option of fieldsOptions()[fieldName]; track $index) {
                        <nz-auto-option [nzValue]="option" [nzLabel]="option.label">
                          {{ option.label }}
                        </nz-auto-option>
                      }
                    </nz-autocomplete>
                  }
                }
                <val-errors [controlName]="fieldName" />
              </pos-form-item>
            }
            <button type="submit" style="display: none;"></button>
          </form>
        </nz-spin>
      </ng-container>
    </nz-modal>
  `
})
export class PosCrudModalForm<T> {
  protected store = inject<IModalFormStore<T>>(MODAL_FORM_STORE);
  protected formBuilder = inject(FormBuilder);

  @ViewChildren('inputs') inputs!: QueryList<ElementRef<HTMLInputElement>>;

  config = input<FormModalConfig>({});
  onClose = output<any>();

  // get the form keys
  formKeys = computed(() => Object.keys(this.config()));

  // get the form group
  formGroup = computed(() => {
    const formConfig = Object.entries(this.config()).reduce((acc, [key, value]) => {
      acc[key] = value.control;
      return acc;
    }, {} as any)

    return this.formBuilder.group(formConfig);
  });

  // get the required fields
  requiredFields = computed(() => Object.keys(this.formGroup().controls)
    .filter(key => this.formGroup().get(key)?.hasValidator(Validators.required))
  );

  fieldsWithOptions = computed(() => Object.keys(this.config())
    .filter(key => this.config()[key].options)
  );

  fieldsOptions = signal<{[key: string]: ControlOption[]}>({});

  afterOpen() {
    this.fieldsOptions.set(
      this.fieldsWithOptions().reduce((acc, key) => {
        acc[key] = this.config()[key].options ?? [];
        return acc;
      }, {} as {[key: string]: ControlOption[]})
    );

    if (this.store.formEditMode() && this.store.formItem()) {
      this.patchFormValue(this.store.formItem() as any);
    }

    setTimeout(() => this.inputs.first?.nativeElement?.focus(), 0);
  }

  onCancel() {
    this.store.hideModalForm();
  }

  afterClose() {
    this.formGroup().reset();
  }

  onOk() {
    if (!this.formGroup().valid) {
      Object.values(this.formGroup().controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    const formValue = this.store.getFormValue(this.formGroup());
    
    if (this.store.formEditMode()) {
      if (this.store.formItem() !== formValue) {
        this.store.update(formValue);
      }
    } else {
      this.store.create(formValue);
    }
    
    this.onClose.emit(formValue);
    this.store.hideModalForm();
  }

  updateAutocompleteOptions(fieldName: string, value: string | ControlOption) {
    // Get the value as a string
    const strValue = (typeof value === 'string' ? value : value.value).trim();
    // Get the possible options
    const options = this.config()[fieldName].options ?? [];
    // Filter the options
    const filteredOptions = options.filter(option => option.label.toLowerCase().includes(strValue.toLowerCase()));
    // Update the options
    this.fieldsOptions.update(prev => ({ ...prev, [fieldName]: filteredOptions }));
  }

  compareFun = (o1: any, o2: any): boolean => {
    if (o1) {
      return typeof o1 === 'string' ? o1 === o2.label : o1.value === o2.value;
    } else {
      return false;
    }
  };

  private patchFormValue(formValue: any) {
    const patchedFormValue = { ...formValue };
    Object.entries(this.config()).forEach(([key, value]) => {
      if (value.options) {
        patchedFormValue[key] = value.options?.find(option => option.value === formValue[key]);
      }
      if (value.transform) {
        patchedFormValue[key] = value.transform(formValue[key]);
      }
    });

    this.formGroup().patchValue(patchedFormValue);
  }
}

