import {ErrorHandler, Injectable} from '@angular/core';
import {NotificationService} from '../services/notification.service';
import {HttpErrorResponse} from '@angular/common/http';
import {PibaError} from '../entities';

@Injectable()
export class ErrorNotificationHandler implements ErrorHandler {
  constructor(
    private notificationService: NotificationService
  ) {
  }

  public handleError(error: Error | PibaError | HttpErrorResponse): void {
    if (console) {
      console.log(error);
    }

    if (error instanceof PibaError) {
      console.log('CAUSE', error.cause);
      this.notificationService.error(error.detail, error.summary);
    } else if (error instanceof HttpErrorResponse) {
      this.notificationService.error(error.statusText, error.message);
    }
  }
}
