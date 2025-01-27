import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlightText'
})
export class HighlightWordsPipe implements PipeTransform {
  // Inject DomSanitizer to bypass security
  private sanitizer = inject(DomSanitizer);

  transform(value: string, boldWords: string[]): SafeHtml {
    // Return original text if no boldWords provided
    if (!value || !boldWords || boldWords.length === 0) {
      return value; 
    }
    
    // Match whole words case-insensitively
    const regex = new RegExp(`(${boldWords.join('|')})`, 'gi');
    
    // Wrap matches in <b> tags
    const highlighted = value.replace(regex, '<b>$1</b>');
    
    // Sanitize and return the HTML
    return this.sanitizer.bypassSecurityTrustHtml(highlighted); 
  }
}