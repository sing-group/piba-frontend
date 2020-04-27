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

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Role, User} from '../models/User';
import {Observable} from 'rxjs';
import {PibaError} from '../modules/notification/entities';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private user: User = new User();

  constructor(private  http: HttpClient) {
  }

  checkCredentials(login: string, password: string): Observable<Role> {
    this.user.login = login;
    this.user.password = password;
    return this.http.get<Role>(`${environment.restApi}/user/${login}/role`)
      .pipe(
        PibaError.throwOnError('Failed to login', `User or password incorrect. Please try again.`)
      );
  }

  public logIn(login: string, password: string, role: Role) {
    this.user.login = login;
    this.user.password = password;
    this.user.role = role;
    this.user.authHeader = this.getAuthorizationHeader();
    this.user.authenticated = true;
    this.user.save();
  }

  public logOut() {
    this.user.clear();
    this.user = new User();
  }

  public getAuthorizationHeader(): string {
    return 'Basic ' + btoa(this.user.login + ':' + this.user.password);
  }

  public getUser(): User {
    return this.user;
  }

  public getRole(): Role {
    return this.user.role;
  }

  public isGuest(): boolean {
    return !this.user.authenticated;
  }
}
