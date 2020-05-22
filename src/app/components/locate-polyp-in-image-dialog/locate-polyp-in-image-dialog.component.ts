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
import {PolypLocation} from '../../models/PolypLocation';

export class LocationResult {
  readonly cancelled: boolean;
  readonly location?: PolypLocation;
}

@Component({
  selector: 'app-locate-polyp-in-image-dialog',
  templateUrl: './locate-polyp-in-image-dialog.component.html',
  styleUrls: ['./locate-polyp-in-image-dialog.component.css']
})
export class LocatePolypInImageDialogComponent {
  private _open: boolean;
  @Output() openChange = new EventEmitter<boolean>();

  @Input() title = 'Locate polyp';
  @Input() src: string;
  @Input() polypLocation: PolypLocation = null;

  @Input() disabled = false;
  @Input() disabledMessage = '';

  @Output() close = new EventEmitter<LocationResult>();

  constructor() { }

  get open(): boolean {
    return this._open;
  }

  @Input() set open(open: boolean) {
    if (this._open !== open) {
      this._open = open;
      this.openChange.emit(open);
    }
  }

  hasPolypLocation(): boolean {
    return Boolean(this.polypLocation);
  }

  onDiscard(): void {
    this.polypLocation = null;
  }

  onCancel(): void {
    this.close.emit({
      cancelled: true
    });
    this.open = false;
    this.polypLocation = null;
  }

  onSave(): void {
    this.close.emit({
      cancelled: false,
      location: this.polypLocation
    });
    this.open = false;
    this.polypLocation = null;
  }
}
