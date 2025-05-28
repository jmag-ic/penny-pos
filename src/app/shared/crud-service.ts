import { FormGroup } from "@angular/forms";
import { Observable } from "rxjs";

import { Page, PageParams } from "@pos/models";

export interface ICrudService<T, D> {
  create: (item: T) => Promise<D>;
  delete: (item: T) => Promise<D>;
  getFormValue: (item: T | null, form: FormGroup) => T;
  load: (pageParams: PageParams<T>) => Observable<Page<T>>;
  update: (item: T) => Promise<D>;
  findItem: (items: T[], selectedItem: T) => T;
}