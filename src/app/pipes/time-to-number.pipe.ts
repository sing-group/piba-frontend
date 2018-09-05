import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeToNumber'
})
export class TimeToNumberPipe implements PipeTransform {

  transform(time: String): number {
    const split = time.split(':');
    const minutes = split[0];
    const seconds = split[1];
    return (parseInt(minutes, 10) * 60 + parseInt(seconds, 10));
  }

}
