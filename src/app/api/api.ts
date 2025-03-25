import { Injectable } from "@angular/core";
import { Repository } from "../../../db/repository";

const repository = <Repository>((<any>window).repository)

@Injectable({
  providedIn: 'root'
})
export class Api {
  
  checkout(items: any[], customerName: string, paymentMethod: string) {
    return repository.checkout(items, customerName, paymentMethod)
  }

  getProducts(text: string, limit: number=-1, offset: number=0) {
    return repository.getItems(text, limit, offset)
  }
}