import {Severity} from './severity.model';

export interface ErrorMessage {
  severity: Severity;
  summary: string;
  detail: string;
}
