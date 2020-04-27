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

import {Component, OnInit} from '@angular/core';
import {IdSpace} from '../../models/IdSpace';
import {IdSpacesService} from '../../services/idspaces.service';
import {NotificationService} from '../../modules/notification/services/notification.service';

@Component({
  selector: 'app-idspace',
  templateUrl: './idspace.component.html',
  styleUrls: ['./idspace.component.css']
})
export class IdspaceComponent implements OnInit {

  creatingIdSpace = false;
  editingIdSpace = false;
  deletingIdSpace = false;
  idSpace: IdSpace = new IdSpace();

  idSpaces: IdSpace[] = [];

  constructor(private idSpacesService: IdSpacesService, private notificationService: NotificationService) {
    this.idSpacesService.getIdSpaces().subscribe((idSpaces) => this.idSpaces = idSpaces);
  }

  ngOnInit() {
  }

  save() {
    if (this.creatingIdSpace) {
      this.idSpacesService.createIdSpace(this.idSpace).subscribe(
        (newIDSpace) => {
          this.idSpaces = this.idSpaces.concat(newIDSpace);
          this.notificationService.success('ID Space registered successfully.', 'ID Space registered.');
          this.cancel();
        });
    } else {
      this.idSpacesService.editIdSpace(this.idSpace).subscribe(updated => {
          Object.assign(this.idSpaces.find((idSpace) => idSpace.id === this.idSpace.id), updated);
          this.notificationService.success('ID Space edited successfully.', 'ID Space edited.');
          this.cancel();
        }
      );
    }

  }

  edit(id: string) {
    this.editingIdSpace = true;
    this.idSpace = new IdSpace();
    Object.assign(this.idSpace, this.idSpaces.find((idSpace) => idSpace.id === id));
  }

  delete(id: string) {
    this.idSpacesService.delete(id).subscribe(() => {
      const index = this.idSpaces.indexOf(
        this.idSpaces.find((idSpace) => idSpace.id === id)
      );
      this.idSpaces.splice(index, 1);
      this.notificationService.success('ID Space removed successfully.', 'ID Space removed.');
    });
    this.cancel();
  }

  remove(id: string) {
    this.deletingIdSpace = true;
    this.idSpace = this.idSpaces.find((idSpace) => idSpace.id === id);
  }

  cancel() {
    this.idSpace = new IdSpace();
    this.creatingIdSpace = false;
    this.editingIdSpace = false;
    this.deletingIdSpace = false;
  }

}
