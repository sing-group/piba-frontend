import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {

  transform(time: number): String {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time - minutes * 60);

    const formatTime = timeToFormat => timeToFormat < 10 ? '0' + timeToFormat : timeToFormat;

    return formatTime(minutes) + ':' + formatTime(seconds);
  }
}
