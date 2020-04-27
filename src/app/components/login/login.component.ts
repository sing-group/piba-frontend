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
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {UsersService} from '../../services/users.service';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {NewPassword} from '../../models/NewPassword';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  login: string;
  password: string;
  confirmPassword: string;
  return = '';
  recovery = false;
  userRecovery: string;
  newPassword: NewPassword = new NewPassword();

  constructor(private authenticationService: AuthenticationService,
              private usersService: UsersService,
              private notificationService: NotificationService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.newPassword.uuid = this.route.snapshot.queryParamMap.get('uuid');
    this.route.queryParams
      .subscribe(params => this.return = params['return'] || '');
  }

  logIn() {
    this.authenticationService.checkCredentials(this.login, this.password).subscribe((role) => {
      this.authenticationService.logIn(this.login, this.password, role);
      this.router.navigateByUrl(this.return);
    });
  }

  isTryingToLogin(): boolean {
    return !this.recovery && this.newPassword.uuid === null;
  }

  isTryingToRecoverPassword(): boolean {
    return !this.recovery && this.newPassword.uuid !== null;
  }

  isWantingToRecoverPassword(): boolean {
    return this.recovery;
  }

  goToLogin() {
    this.recovery = false;
  }

  goToPasswordRecovery() {
    this.recovery = true;
  }

  recoverPassword() {
    this.usersService.recoverPassword(this.userRecovery).subscribe(
      () => {
        this.recovery = false;
        this.router.navigateByUrl('/');
      }
    );
  }

  updatePassword() {
    this.usersService.updatePassword(this.newPassword).subscribe(
      () => {
        this.notificationService.success('Password changed successfully.', 'Password changed');
      },
      response => {
        this.notificationService.error('Password not changed. ' + response.error, 'Error.');
      });

    this.router.navigateByUrl('/');
  }

}
