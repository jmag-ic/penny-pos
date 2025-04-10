import { Component, computed, ElementRef, inject, InjectionToken, input, QueryList, ViewChildren, signal, effect, OnInit, output } from "@angular/core";
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
import { ICrudTableStore, CRUD_TABLE_STORE } from "./with-crud-table";

export type FormModalConfig = { 
  [key: string]: { 
    label: string, 
    type: string | 'text' | 'number' | 'select' | 'date' | 'switch' | 'autocomplete', 
    control: any,
    options?: { label: string, value: any }[]
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
          <form nz-form [nzAutoTips]="autoTips" [formGroup]="formGroup()" (ngSubmit)="onOk()">
            @for (field of formKeys(); track field) {
              <nz-form-item>
                <nz-form-label [nzSpan]="5" [nzRequired]="requiredFields().includes(field)">{{ config()[field].label }}</nz-form-label>
                <nz-form-control [nzSpan]="19">
                  @switch (config()[field].type) {
                    @case ('string') {
                      <input #inputs nz-input [formControlName]="field" />
                    }
                    @case ('text') {
                      <textarea #inputs nz-input [formControlName]="field"></textarea>
                    }
                    @case ('number') {
                      <input #inputs type="number" nz-input [formControlName]="field" />
                    }
                    @case ('select') {
                      <nz-select #inputs nzShowSearch nzAllowClear [formControlName]="field" nzStyle="width: 100%">
                        @for (option of config()[field].options; track option.value) {
                          <nz-option [nzValue]="option.value" [nzLabel]="option.label" />
                        }
                      </nz-select>
                    }
                    @case ('date') {
                      <nz-date-picker #inputs [formControlName]="field" nzStyle="width: 100%" />
                    }
                    @case ('switch') {
                      <nz-switch #inputs [formControlName]="field" />
                    }
                    @case ('autocomplete') {
                      <input #inputs nz-input [nzAutocomplete]="auto" [formControlName]="field" nzStyle="width: 100%" />
                      <nz-autocomplete #auto [nzDataSource]="getAutocompleteOpts(field)" />
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
  protected store = inject<ICrudTableStore<T>>(CRUD_TABLE_STORE);
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

  // auto tips
  autoTips: Record<string, Record<string, string>> = {
    default: {
      required: 'Campo requerido',
      min: 'Valor inválido'
    }
  };

  afterOpen() {
    setTimeout(() => {
      if (this.store.formEditMode() && this.store.selectedItem()) {
        this.formGroup().patchValue(this.store.selectedItem() as any);
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

    const formValue = this.store.getFormValue(this.store.selectedItem(), this.formGroup());
    
    if (this.store.formEditMode()) {
      if (this.store.selectedItem() !== formValue) {
        this.store.update(formValue);
      }
    } else {
      this.store.create(formValue);
    }
    
    this.onClose.emit(formValue);
    this.store.hideModalForm();
  }

  getAutocompleteOpts(field: string) {
    // get value from form group
    const value = this.formGroup().get(field)?.value;
    if (!value) {
      return [];
    }
    // get options from config
    const options = this.config()[field].options;
    // return options filtered by value
    return options?.filter(option => option.label.toLowerCase().includes(value.toLowerCase()));
  }
}
