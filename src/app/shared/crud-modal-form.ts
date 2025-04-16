import { Component, computed, ElementRef, inject, input, QueryList, ViewChildren, output } from "@angular/core";
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
import { IModalFormStore, MODAL_FORM_STORE } from "./with-crud-modal-form";
import { CaseTransform, InputAlphanumericDirective } from "./input-alphanumeric";

export type FormModalConfig = {
  [key: string]: {
    control: any,
    controlSpan?: number,
    label: string, 
    labelSpan?: number,
    alphanumeric?: {
      case?: CaseTransform,
    },
    options?: { label: string, value: any }[],
    type: string | 'text' | 'number' | 'select' | 'date' | 'switch' | 'autocomplete',
  } 
}

@Component({
  selector: 'pos-form-modal',
  imports: [
    FormsModule, 
    NzAutocompleteModule,
    NzDatePickerModule,
    NzFormModule, 
    NzInputModule, 
    NzInputNumberModule,
    NzModalModule, 
    NzSelectModule,
    NzSpinModule,
    NzSwitchModule,
    ReactiveFormsModule,
    InputAlphanumericDirective
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
              <nz-form-item>
                <nz-form-label [nzSpan]="field.labelSpan ?? 5" [nzRequired]="requiredFields().includes(fieldName)">{{ field.label }}</nz-form-label>
                <nz-form-control [nzSpan]="field.controlSpan ?? 19">
                  
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
                      <nz-date-picker #inputs [formControlName]="fieldName" />
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
                      />
                      <nz-autocomplete #auto [compareWith]="compareFun">
                        @for (option of getAutocompleteOpts(fieldName); track $index) {
                          <nz-auto-option [nzValue]="option" [nzLabel]="option.label">
                            {{ option.label }}
                          </nz-auto-option>
                        }
                      </nz-autocomplete>
                    }
                  }
                </nz-form-control>
              </nz-form-item>
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

  afterOpen() {
    setTimeout(() => {
      if (this.store.formEditMode() && this.store.formItem()) {
        this.patchFormValue(this.store.formItem() as any);
      }
      this.inputs.first.nativeElement.focus();
    }, 0);
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

  getAutocompleteOpts(field: string) {
    // get options from config
    const options = this.config()[field].options;
    // get value from form group
    const formValue = this.formGroup().get(field)?.value;
    
    if (!formValue) {
      return options ?? [];
    }

    const strValue = typeof formValue === 'string' ? formValue : formValue.value;
    
    if (!strValue) {
      return options ?? [];
    }

    // return options filtered by value
    return options?.filter(option => option.label.toLowerCase().includes(strValue.toLowerCase()));
  }

  private patchFormValue(formValue: any) {
    const patchedFormValue = { ...formValue };
    Object.entries(this.config()).forEach(([key, value]) => {
      if (value.options) {
        patchedFormValue[key] = value.options?.find(option => option.value === formValue[key]);
      }
    });    

    this.formGroup().patchValue(patchedFormValue);
  }

  compareFun = (o1: any, o2: any): boolean => {
    if (o1) {
      return typeof o1 === 'string' ? o1 === o2.label : o1.value === o2.value;
    } else {
      return false;
    }
  };
}

