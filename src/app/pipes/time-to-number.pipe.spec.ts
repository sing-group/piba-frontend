import { TimeToNumberPipe } from './time-to-number.pipe';

describe('TimeToNumberPipe', () => {
  it('create an instance', () => {
    const pipe = new TimeToNumberPipe();
    expect(pipe).toBeTruthy();
  });
});
