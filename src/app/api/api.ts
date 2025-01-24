import { Injectable } from "@angular/core";
import { Product } from "./models";
import { Repository } from "../../../db/repository";
import { fromPromise } from "rxjs/internal/observable/innerFrom";
import { Observable } from "rxjs";

const repository = <Repository>((<any>window).repository)

@Injectable({
  providedIn: 'root'
})
export class ElectronApi {
  getProducts(text: string, limit: number=-1, offset: number=0) {
    return repository.getItems(text, limit, offset)
  }
}