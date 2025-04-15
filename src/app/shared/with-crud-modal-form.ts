import { computed, inject, InjectionToken, ProviderToken } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { signalStoreFeature, withState, withMethods, patchState, withComputed } from "@ngrx/signals";
import { ICrudService } from "./crud-service";

export const MODAL_FORM_STORE = new InjectionToken<IModalFormStore<any>>('MODAL_FORM_STORE');

export type ModalFormState<T> = {
  formEditMode: boolean;
  formItem: T | null;
  loadingForm: boolean;
  modalTitle: string;
  modalVisible: boolean;
}

export interface IModalFormStore<T> {
  elementName: () => string;
  elementSubject: () => string;
  formEditMode: () => boolean;
  formItem: () => T | null;
  loadingForm: () => boolean;
  modalTitle: () => string;
  modalVisible: () => boolean;
  // Getters
  getFormValue: (form: FormGroup) => T;
  // Methods
  create: (item: T) => Promise<T>;
  hideModalForm: () => void;
  showModalForm: (title: string, item: T | null) => void;
  update: (item: T) => Promise<T>;
}

export const withCrudModalForm = <T, D>(
  CrudService: ProviderToken<ICrudService<T, D>>,
) => {
  const initialState: ModalFormState<T> = {
    formEditMode: false,
    loadingForm: false,
    modalTitle: '',
    modalVisible: false,
    formItem: null
  }

  return signalStoreFeature(
    withState(initialState),
    withMethods(store => {
      const crudService = inject(CrudService);

      return {
        // Getters
        getFormValue (form: FormGroup) {
          return crudService.getFormValue(store.formItem(), form);
        },
        // Methods
        async create (item: T) {
          if (store.loadingForm())
            return;

          patchState(store, {
            loadingForm: true,
          });

          try {
            await crudService.create(item);
            patchState(store, {
              modalVisible: false,
              loadingForm: false,
            });
          } catch (error) {
            patchState(store, {
              loadingForm: false,
            });
            console.error(error);
            throw error;
          }
        },
        hideModalForm () {
          patchState(store, {
            modalVisible: false
          });
        },
        showModalForm (title: string, item: T | null) {
          patchState(store, {
            modalVisible: true,
            modalTitle: title,
            formItem: item,
            formEditMode: !!item,
          });
        }, 
        async update (item: T) {
          if (store.loadingForm())
            return;

          patchState(store, {
            loadingForm: true,
          });

          try {
            await crudService.update(item);
            patchState(store, {
              modalVisible: false,
              loadingForm: false,
            });
          } catch (error) {
            patchState(store, {
              loadingForm: false,
            });
            console.error(error);
            throw error;
          }
        },
      }
    })
  )
}