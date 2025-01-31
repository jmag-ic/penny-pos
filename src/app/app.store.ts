import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap } from "rxjs";

type AppState = {
  collapsedMenu: boolean
};

const initialState: AppState = {
  collapsedMenu: false
};

export const AppStore = signalStore(
  { providedIn: 'root'},

  withState(initialState),

  withMethods(store => ({
    setCollapsedMenu: rxMethod<boolean>(pipe(
      tap(isCollapsed => patchState(store, {collapsedMenu: isCollapsed}))
    ))
  }))
);