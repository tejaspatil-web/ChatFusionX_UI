import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textTransform',
})
export class TextTransformPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }

    const regex = /\*\*(.*?)\*\*/g;
    return value.replace(regex, '<b>$1</b>');
  }
}
