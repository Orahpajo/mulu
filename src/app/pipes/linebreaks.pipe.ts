import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'linebreaks'
})
export class LinebreaksPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value  
      // nonbreaking spaces
      .replace(/ /g, '&nbsp;')
      // line breaks
      .replace(/\n/g, '<br>');
  }
}