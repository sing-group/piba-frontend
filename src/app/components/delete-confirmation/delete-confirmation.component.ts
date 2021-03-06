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

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-delete-confirmation',
  templateUrl: './delete-confirmation.component.html',
  styleUrls: ['./delete-confirmation.component.css']
})
export class DeleteConfirmationComponent implements OnInit {

  // id that is used to delete the object
  @Input() id: string;
  // identifying name that will be shown
  @Input() name: string;
  // type of model to delete
  @Input() modelName: string;
  @Input() message: string;

  private _open = false;
  @Output() openChange = new EventEmitter<boolean>();

  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  ngOnInit() {
    if (this.message === undefined) {
      this.message = `Are you sure you want to delete <strong>${this.name}</strong>?` +
        '<div class="warning">This action is permanent and cannot be undone.</div>';
    }
  }

  @Input()
  public set open(open: boolean) {
    if (this._open !== open) {
      this._open = open;
      this.openChange.emit(this._open);
    }
  }

  public get open(): boolean {
    return this._open;
  }

  onConfirm(): void {
    this.confirm.emit(this.id);
    this.open = false;
  }

  onCancel(): void {
    this.cancel.emit();
    this.open = false;
  }
}
