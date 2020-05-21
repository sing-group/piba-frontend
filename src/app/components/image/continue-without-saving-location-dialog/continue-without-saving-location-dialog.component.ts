import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-continue-without-saving-location-dialog',
  templateUrl: './continue-without-saving-location-dialog.component.html',
  styleUrls: ['./continue-without-saving-location-dialog.component.css']
})
export class ContinueWithoutSavingLocationDialogComponent {
  private _open = false;

  @Output() openChange = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<boolean>();

  constructor() { }

  get open(): boolean {
    return this._open;
  }

  @Input()
  set open(open: boolean) {
    this._open = open;
    this.openChange.emit(this._open);
  }

  onContinue(): void {
    this.close.emit(true);
    this.open = false;
  }

  onCancel(): void {
    this.close.emit(false);
    this.open = false;
  }
}
