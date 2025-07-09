import { Directive, ElementRef, input, OnDestroy, output } from '@angular/core';
import { debounce, distinctUntilChanged, fromEvent, interval, map, Subscription } from 'rxjs';

@Directive({
  selector: 'input[inputDebouncer]'
})
export class InputDebouncer implements OnDestroy {
  // Inputs
  readonly debounceTime = input<number>(300);

  // Outputs
  readonly textChanged = output<string>();

  // The subscription to the keyup event
  private keyUpSub: Subscription;

  constructor(input: ElementRef<HTMLInputElement>) {
    // Create a subscription to the keyup event.
    this.keyUpSub = fromEvent(input.nativeElement,'keyup').pipe(
      // Get the value of the input element and trim it
      map(event => ((<KeyboardEvent>event).target as HTMLInputElement).value),
      // Debounce the emission if the text is not empty
      debounce(() => interval(this.debounceTime())),
      // Only emit the text if it is different from the previous one
      distinctUntilChanged()
    ).subscribe(text => this.textChanged.emit(text));
  }

  // Unsubscribe from the keyup event when the directive is destroyed
  ngOnDestroy(): void {
    this.keyUpSub.unsubscribe();
  }
}