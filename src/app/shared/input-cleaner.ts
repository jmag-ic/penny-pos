import { Directive, ElementRef, OnDestroy } from '@angular/core';
import { filter, fromEvent, Subscription } from 'rxjs';

@Directive({
  selector: 'input[inputCleaner]'
})
export class InputCleaner implements OnDestroy {
  // The subscription to the keydown event
  private keyDownSub: Subscription;

  constructor(input: ElementRef<HTMLInputElement>) {
    // Clear the input value when the user presses the escape key
    this.keyDownSub =  fromEvent(input.nativeElement, 'keydown').pipe(
      filter(event => (<KeyboardEvent>event).code === 'Escape')
    ).subscribe(() => {
      input.nativeElement.value = '';
    });
  }

  // Unsubscribe from the keydown event when the directive is destroyed
  ngOnDestroy() {
    this.keyDownSub.unsubscribe();
  }
}