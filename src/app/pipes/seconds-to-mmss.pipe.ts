import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mmss'
})
export class SecondsToMmssPipe implements PipeTransform {

  transform(value: number | null | undefined): string {
    if (value == null || isNaN(value)) return '0:00';
    const m = Math.floor(value / 60);
    const s = Math.floor(value % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

}
