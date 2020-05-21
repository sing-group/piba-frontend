import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ImagesService} from '../../../services/images.service';

@Component({
  selector: 'app-describe-polyp-deletion-dialog',
  templateUrl: './describe-polyp-deletion-dialog.component.html',
  styleUrls: ['./describe-polyp-deletion-dialog.component.css']
})
export class DescribePolypDeletionDialogComponent {
  private _open = false;

  @Output() openChange = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<string>();

  readonly predefinedReasons = ['Not dataset', 'Bad quality', 'Others'];
  selectedPredefinedReason = '';

  newReasonPrefix = '';

  newReason?: string;
  suggestedReasons: string[] = [];

  constructor(
    private readonly imagesService: ImagesService
  ) { }

  get open(): boolean {
    return this._open;
  }

  @Input()
  set open(open: boolean) {
    this._open = open;
    this.openChange.emit(this._open);
  }

  isOthersSelected(): boolean {
    return this.selectedPredefinedReason === 'Others';
  }

  isValid(): boolean {
    return Boolean(this.selectedPredefinedReason) && (!this.isOthersSelected() || Boolean(this.newReason));
  }

  hasSuggestedReasons(): boolean {
    return this.suggestedReasons.length > 0;
  }

  onFindSuggestedReasons(event: KeyboardEvent) {
    this.newReason = null;
    this.suggestedReasons = [];

    if (event.key === 'Enter') {
      this.newReason = this.newReasonPrefix;
    } else if (Boolean(this.newReasonPrefix) && this.newReasonPrefix.length >= 3) {
      this.imagesService.searchObservations(this.newReasonPrefix)
        .subscribe(suggestedReasons => {
          this.suggestedReasons = suggestedReasons
            .filter(reason => !this.predefinedReasons.includes(reason));

          if (this.suggestedReasons.length === 0) {
            this.newReason = this.newReasonPrefix;
          }
        });
    }
  }

  onSelectSuggestedReason(reason: string) {
    this.newReason = reason;
    this.newReasonPrefix = reason;
  }

  onCancelDeletion() {
    this.open = false;
    this.close.emit(null);
  }

  onConfirmDeletion() {
    this.open = false;
    if (this.isOthersSelected()) {
      this.close.emit(this.newReason);
    } else {
      this.close.emit(this.selectedPredefinedReason);
    }
  }
}
