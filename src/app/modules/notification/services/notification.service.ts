import {EventEmitter, Injectable} from '@angular/core';
import {ErrorMessage, Severity} from '../entities';
import {Observable} from 'rxjs';

@Injectable()
export class NotificationService {
  private readonly messageEmitter: EventEmitter<ErrorMessage>;

  constructor() {
    this.messageEmitter = new EventEmitter<ErrorMessage>();
  }

  public getMessages(): Observable<ErrorMessage> {
    return this.messageEmitter;
  }

  public success(detail: string, summary: string): void {
    this.messageEmitter.emit({
      severity: Severity.SUCCESS, summary: summary, detail: detail
    });
  }

  public info(detail: string, summary: string): void {
    this.messageEmitter.emit({
      severity: Severity.INFO, summary: summary, detail: detail
    });
  }

  public warning(detail: string, summary: string): void {
    this.messageEmitter.emit({
      severity: Severity.WARNING, summary: summary, detail: detail
    });
  }

  public error(detail: string, summary: string): void {
    this.messageEmitter.emit({
      severity: Severity.ERROR, summary: summary, detail: detail
    });
  }
}
