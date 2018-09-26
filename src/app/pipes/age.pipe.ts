import {Pipe, PipeTransform} from '@angular/core';
import {AgeFromDate} from 'age-calculator/built/age-calculator';

@Pipe({
  name: 'age'
})
export class AgePipe implements PipeTransform {

  transform(birthdate: Date): number {
    return new AgeFromDate(new Date(birthdate)).age;
  }

}
