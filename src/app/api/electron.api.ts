import { Injectable } from "@angular/core";
import { Product } from "./model";
import { Repository } from "../../../db/repository";
import { fromPromise } from "rxjs/internal/observable/innerFrom";
import { Observable } from "rxjs";

const repo = <Repository>((<any>window).repository)

@Injectable({
  providedIn: 'root'
})
export class ElectronApi {
  getProducts(text: string, limit: number=-1, offset: number=0): Observable<Product[]> {
    return fromPromise(repo.getItems(text, limit, offset))
  }
}