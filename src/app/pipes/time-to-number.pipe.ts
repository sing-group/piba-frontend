import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeToNumber'
})
export class TimeToNumberPipe implements PipeTransform {
  private static readonly TIME_REGEX = /^[0-9]{2,}:[0-5][0-9]$/;

  static isValidTime(time: string): boolean {
    return time !== undefined && time !== null && TimeToNumberPipe.TIME_REGEX.test(time);
  }

  transform(time: string): number {
    const split = time.split(':');
    const minutes = split[0];
    const seconds = split[1];
    return (parseInt(minutes, 10) * 60 + parseInt(seconds, 10));
  }
}
