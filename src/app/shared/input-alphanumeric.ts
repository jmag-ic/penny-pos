import { Directive, ElementRef, Input, OnInit, inject } from '@angular/core';
import { input } from '@angular/core';

export type CaseTransform = 'uppercase' | 'lowercase' | 'titlecase' | 'none';

@Directive({
  selector: 'input[inputAlphanumeric], textarea[inputAlphanumeric]',
  standalone: true
})
export class InputAlphanumericDirective implements OnInit {
  private el: ElementRef<HTMLInputElement | HTMLTextAreaElement> = inject(ElementRef);
  
  @Input() inputAlphanumeric: boolean = true;
  case = input<CaseTransform>('none');

  ngOnInit() {
    if (this.inputAlphanumeric) {
      this.el.nativeElement.addEventListener('input', this.handleInput.bind(this));
      this.el.nativeElement.addEventListener('paste', (event: Event) => this.handlePaste(event as ClipboardEvent));
    }
  }

  private handleInput(event: Event) {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement;
    const value = input.value;
    const transformedValue = this.transformCase(this.cleanAlphanumeric(value));
    
    // Only update if the value has changed
    if (value !== transformedValue) {
      const start = input.selectionStart || 0;
      input.value = transformedValue;
      input.setSelectionRange(start, start);
      
      // Dispatch input event to update form control
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  private handlePaste(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const pastedText = clipboardData.getData('text');
    const cleanedText = this.cleanAlphanumeric(pastedText);
    const transformedText = this.transformCase(cleanedText);
    
    const input = event.target as HTMLInputElement | HTMLTextAreaElement;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    
    const newValue = input.value.substring(0, start) + transformedText + input.value.substring(end);
    input.value = newValue;
    input.setSelectionRange(start + transformedText.length, start + transformedText.length);
    
    // Dispatch input event to update form control
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  private cleanAlphanumeric(text: string): string {
    return text.replace(/[^a-zA-Z0-9\s#]/g, '');
  }

  private transformCase(text: string): string {
    switch (this.case()) {
      case 'uppercase':
        return text.toUpperCase();
      case 'lowercase':
        return text.toLowerCase();
      case 'titlecase':
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
      default:
        return text;
    }
  }
} 