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
    
    // Normalize the input text and search words to remove accents
    const normalizedValue = this.normalizeText(value);
    const normalizedWords = boldWords.map(word => this.normalizeText(word));
    
    // Match whole words case-insensitively with normalized text
    const regex = new RegExp(`(${normalizedWords.join('|')})`, 'gi');
    
    // Replace matches in normalized text with placeholders
    let highlighted = normalizedValue.replace(regex, (match, _) => {
      const startPos = normalizedValue.indexOf(match);
      const endPos = startPos + match.length;
      return `<b>${value.substring(startPos, endPos)}</b>`;
    });
    
    // Sanitize and return the HTML
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }

  private normalizeText(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}