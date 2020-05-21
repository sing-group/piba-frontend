import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

export enum RemoveLocationAction {
  ONLY_CLEAR, DISCARD, CANCEL
}

@Component({
  selector: 'app-confirm-removing-location-dialog',
  templateUrl: './confirm-removing-location-dialog.component.html',
  styleUrls: ['./confirm-removing-location-dialog.component.css']
})
export class ConfirmRemovingLocationDialogComponent {
  private _open = false;

  @Output() openChange = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<RemoveLocationAction>();

  constructor() { }

  get open(): boolean {
    return this._open;
  }

  @Input()
  set open(open: boolean) {
    this._open = open;
    this.openChange.emit(this._open);
  }

  onCancel() {
    this.close.emit(RemoveLocationAction.CANCEL);
    this.open = false;
  }

  onOnlyClear() {
    this.close.emit(RemoveLocationAction.ONLY_CLEAR);
    this.open = false;
  }

  onDiscard() {
    this.close.emit(RemoveLocationAction.DISCARD);
    this.open = false;
  }
}
