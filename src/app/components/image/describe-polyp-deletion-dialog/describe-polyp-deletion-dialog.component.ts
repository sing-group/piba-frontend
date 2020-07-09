/*
 *  PIBA Frontend
 *
 * Copyright (C) 2018-2020 - Miguel Reboiro-Jato,
 * Daniel Glez-Peña, Alba Nogueira Rodríguez, Florentino Fdez-Riverola,
 * Rubén Domínguez Carbajales, Jesús Miguel Herrero Rivas,
 * Eloy Sánchez Hernández, Laura Rivas Moral,
 * Manuel Puga Jiménez de Azcárate, Joaquín Cubiella Fernández,
 * Hugo López-Fernández, Silvia Rodríguez Iglesias, Fernando Campos Tato.
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ImagesService} from '../../../services/images.service';

class DeletionReason {
  public readonly label: string;
  public readonly reason: string;
}

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
  newReason: string | DeletionReason = '';
  suggestedReasons: DeletionReason[] = [];

  loadingSuggestedReasons = false;

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

  onCancelDeletion() {
    this.clearAndClose(null);
  }

  onConfirmDeletion() {
    let reason: string;
    if (this.isOthersSelected()) {
      if (typeof this.newReason === 'string') {
        reason = this.newReason;
      } else {
        reason = this.newReason.reason;
      }
    } else {
      reason = this.selectedPredefinedReason;
    }

    this.clearAndClose(reason);
  }

  private clearAndClose(reason: string): void {
    this.newReason = '';
    this.selectedPredefinedReason = '';
    this.suggestedReasons = [];
    this.open = false;
    console.log(reason);
    this.close.emit(reason);
  }

  onSuggestedReasonChanged(suggestedReason: string) {
    this.loadingSuggestedReasons = true;
    this.imagesService.searchObservations(suggestedReason)
      .subscribe(
        suggestedReasons => this.suggestedReasons = suggestedReasons.map(reason => ({
          label: reason,
          reason: reason
        })),
        undefined,
        () => this.loadingSuggestedReasons = false
      );
  }
}
