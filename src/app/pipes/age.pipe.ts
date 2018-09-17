import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'age'
})
export class AgePipe implements PipeTransform {

  transform(birthdate: Date): number {
    const timeDiff: number = Math.abs(new Date().getTime() - new Date(birthdate).getTime());
    return Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);
  }

}
