import { FormGroup } from "@angular/forms";
import { Observable } from "rxjs";

import { Page, PageParams } from "@pos/models";

export interface ICrudService<T, D> {
  create: (item: T) => Promise<T>;
  delete: (item: T) => Promise<T>;
  getFormValue: (item: T | null, form: FormGroup) => D;
  load: (pageParams: PageParams<T>) => Observable<Page<T>>;
  update: (item: T) => Promise<T>;
  findItem: (items: T[], selectedItem: T) => T;
}