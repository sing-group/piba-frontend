import {catchError} from 'rxjs/operators';
import {MonoTypeOperatorFunction} from 'rxjs/internal/types';
import {throwError} from 'rxjs';

export class PibaError extends Error {
  public readonly summary: string;
  public readonly detail: string;
  public readonly cause?: Error;

  static throwOnError<T>(summary: string, detail: string): MonoTypeOperatorFunction<T> {
    return catchError(
      (error: Error) => throwError(new PibaError(summary, detail, error))
    );
  }

  constructor(summary: string, detail: string, cause?: Error) {
    super(detail);

    this.summary = summary;
    this.detail = detail;
    this.cause = cause;

    Object.setPrototypeOf(this, PibaError.prototype);
  }
}
