import { inject, ProviderToken } from "@angular/core";
import { withState, withMethods, patchState } from "@ngrx/signals";
import { signalStoreFeature } from "@ngrx/signals";
import { FormGroup } from "@angular/forms";
import { NzNotificationService } from "ng-zorro-antd/notification";

export interface ICrudStore<T> {
  create: (item: T) => Promise<T>;
  update: (item: T) => Promise<T>;
  delete: (item: T) => Promise<void>;
  getFormValue: (item: T, form: FormGroup) => T;
}

export type CrudState<T> = {
  loading: boolean;
  formTitle: string;
  visibleForm: boolean;
  editMode: boolean;
  item: T | null;
}

export const withCrudOperations = <T>(
  CrudService: ProviderToken<ICrudStore<T>>,
) => {
  const initialState: CrudState<T> = {
    loading: false,
    formTitle: '',
    visibleForm: false,
    editMode: false,
    item: null,
  };

  return signalStoreFeature(
    withState(initialState),
    withMethods(store => {
      const crudService = inject(CrudService);
      const notification = inject(NzNotificationService);

      return {
        async create (item: T) {
          if (store.loading())
            return;

          patchState(store, {
            loading: true,
          });

          try {
            await crudService.create(item);
            patchState(store, {
              loading: false,
              visibleForm: false,
              item: null,
            });
            notification.create('success', store.formTitle(), `Elemento creado correctamente`);
          } catch (error) {
            patchState(store, {
              loading: false,
            });
          }
        },
        async update (item: T) {
          if (store.loading())
            return;

          patchState(store, {
            loading: true,
          });

          try {
            await crudService.update(item);
            patchState(store, {
              loading: false,
              visibleForm: false,
              item: null,
            });
            notification.create('success', store.formTitle(), `Elemento actualizado correctamente`);
          } catch (error) {
            patchState(store, {
              loading: false,
            });
          }
        },
        async delete (item: T) {
          try {
            await crudService.delete(item);
          } catch (error) {
            console.error(error);
            notification.create('error', store.formTitle(), `Error al eliminar el elemento`);
          }
        },
        getFormValue (item: T, form: FormGroup) {
          return crudService.getFormValue(item, form);
        },
        showModalForm (title: string, item: T | null) {
          patchState(store, {
            visibleForm: true,
            formTitle: title,
            item: item,
            editMode: item !== null,
          });
        },
        hideModalForm () {
          patchState(store, {
            visibleForm: false,
            formTitle: '',
            item: null,
            editMode: false,
          });
        },
      }
    })
  );
};  