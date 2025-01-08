import { Directive, ElementRef, input, OnDestroy, output } from '@angular/core';
import { debounce, distinctUntilChanged, fromEvent, interval, map, Subscription } from 'rxjs';

@Directive({
  selector: 'input[type=text][posInputDebouncer]'
})
export class InputDebouncerDirective implements OnDestroy {
  // Inputs
  readonly time = input<number>(400);
  readonly minLen = input<number>(2);

  // Outputs
  readonly textChange = output<string>();

  // The subscription to the keyup event
  private keyUpSub: Subscription;

  constructor(input: ElementRef<HTMLInputElement>) {
    // Create a subscription to the keyup event.
    this.keyUpSub = fromEvent(input.nativeElement,'keyup').pipe(
      // Get the value of the input element and trim it
      map(event => ((<KeyboardEvent>event).target as HTMLInputElement).value.trim()),
      // If the text is less than 3 characters, emit an empty string
      map((text: string) => text.length > this.minLen() ? text : ''),
      // Debounce the emission if the text is not empty
      debounce(text => interval(text ? this.time(): 0)),
      // Only emit the text if it is different from the previous one
      distinctUntilChanged()
    ).subscribe(text => this.textChange.emit(text));
  }

  // Unsubscribe from the keyup event when the directive is destroyed
  ngOnDestroy(): void {
    this.keyUpSub.unsubscribe();
  }
}