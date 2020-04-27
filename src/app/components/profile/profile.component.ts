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
import {UsersService} from '../../services/users.service';
import {Users} from '../../models/Users';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {AuthenticationService} from '../../services/authentication.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  loggedUser: Users = new Users();
  password: string;
  confirmPassword: string;
  editingUser = false;

  constructor(private usersService: UsersService,
              private notificationService: NotificationService,
              private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    if (this.authenticationService.getUser().authenticated) {
      this.usersService.getUser(this.authenticationService.getUser().login).subscribe(user => this.loggedUser = user);
    }
  }

  edit() {
    this.editingUser = true;
    // to not show the password in the edition
    this.loggedUser.password = '';
  }

  editUser() {
    this.usersService.editUser(this.loggedUser).subscribe(updatedUser => {
      this.editingUser = false;
      if (this.loggedUser.password !== '') {
        this.authenticationService.logOut();
        this.authenticationService.logIn(this.loggedUser.login, this.loggedUser.password, this.loggedUser.role);
      }
      Object.assign(this.loggedUser, updatedUser);
      this.confirmPassword = '';
      this.notificationService.success('User edited successfully.', 'User edited.');
    });
  }
}
