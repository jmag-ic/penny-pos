import { Directive, ElementRef, input, OnDestroy, output } from '@angular/core';
import { debounce, distinctUntilChanged, fromEvent, interval, map, Subscription } from 'rxjs';

@Directive({
  selector: 'input[inputDebouncer]'
})
export class InputDebouncer implements OnDestroy {
  // Inputs
  readonly debounceTime = input<number>(400);
  readonly textLength = input<number>(3);

  // Outputs
  readonly textChanged = output<string>();

  // The subscription to the keyup event
  private keyUpSub: Subscription;

  constructor(input: ElementRef<HTMLInputElement>) {
    // Create a subscription to the keyup event.
    this.keyUpSub = fromEvent(input.nativeElement,'keyup').pipe(
      // Get the value of the input element and trim it
      map(event => ((<KeyboardEvent>event).target as HTMLInputElement).value.trim()),
      // If the text is less than 3 characters, emit an empty string
      map((text: string) => text.length >= this.textLength() ? text : ''),
      // Debounce the emission if the text is not empty
      debounce(text => interval(text ? this.debounceTime(): 0)),
      // Only emit the text if it is different from the previous one
      distinctUntilChanged()
    ).subscribe(text => this.textChanged.emit(text));
  }

  // Unsubscribe from the keyup event when the directive is destroyed
  ngOnDestroy(): void {
    this.keyUpSub.unsubscribe();
  }
}