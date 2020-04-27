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
import {Modifier} from '../../models/Modifier';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {ModifiersService} from '../../services/modifiers.service';

@Component({
  selector: 'app-modifiers',
  templateUrl: './modifiers.component.html',
  styleUrls: ['./modifiers.component.css']
})
export class ModifiersComponent implements OnInit {

  creatingModifier = false;
  editingModifier = false;
  deletingModifier = false;
  modifier: Modifier = new Modifier();

  modifiers: Modifier[] = [];

  constructor(private modifiersService: ModifiersService, private notificationService: NotificationService) {
    this.modifiersService.getModifiers().subscribe((modifiers) => this.modifiers = modifiers);
  }

  ngOnInit() {
  }

  save() {
    if (this.creatingModifier) {
      this.modifiersService.createModifier(this.modifier).subscribe(
        (newModifier) => {
          this.modifiers = this.modifiers.concat(newModifier);
          this.notificationService.success('Modifier registered successfully.', 'Modifier registered.');
          this.cancel();
        });
    } else {
      this.modifiersService.editModifier(this.modifier).subscribe(updated => {
          Object.assign(this.modifiers.find((modifier) => modifier.id === this.modifier.id), updated);
          this.notificationService.success('Modifier edited successfully.', 'Modifier edited.');
          this.cancel();
        }
      );
    }
  }

  edit(id: string) {
    this.editingModifier = true;
    this.modifier = new Modifier();
    Object.assign(this.modifier, this.modifiers.find((modifier) => modifier.id === id));
  }

  delete(id: string) {
    this.modifiersService.deleteModifier(id).subscribe(() => {
      const index = this.modifiers.indexOf(
        this.modifiers.find((modifier) => modifier.id === id)
      );
      this.modifiers.splice(index, 1);
      this.notificationService.success('Modifier removed successfully.', 'Modifier removed.');
    });
    this.cancel();
  }

  remove(id: string) {
    this.deletingModifier = true;
    this.modifier = this.modifiers.find((modifier) => modifier.id === id);
  }

  cancel() {
    this.modifier = new Modifier();
    this.creatingModifier = false;
    this.editingModifier = false;
    this.deletingModifier = false;
  }

}
