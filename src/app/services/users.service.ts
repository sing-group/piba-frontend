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
import {Users} from '../models/Users';
import {Observable} from 'rxjs';
import {UserInfo} from './entities/UserInfo';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {User} from '../models/User';
import {NewPassword} from '../models/NewPassword';
import {LoginOrEmailInfo} from './entities/LoginOrEmailInfo';
import {NewPasswordInfo} from './entities/NewPasswordInfo';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http: HttpClient) {
  }

  create(user: Users): Observable<Users> {
    const userInfo = this.toUserInfo(user);

    return this.http.post<UserInfo>(`${environment.restApi}/user`, userInfo)
      .pipe(
        map(this.mapUserInfo.bind(this))
      );

  }

  editUser(user: Users): Observable<User> {
    const userInfo = this.toUserInfo(user);
    return this.http.put<UserInfo>(`${environment.restApi}/user/${user.login}`, userInfo)
      .pipe(
        map(this.mapUserInfo.bind(this))
      );
  }

  deleteUser(login: string) {
    return this.http.delete(`${environment.restApi}/user/${login}`);
  }

  getUsers(): Observable<Users[]> {
    return this.http.get<UserInfo[]>(`${environment.restApi}/user/`).pipe(
      map((users) => users.map(this.mapUserInfo.bind(this)))
    );
  }

  getUser(login: string): Observable<Users> {
    return this.http.get<UserInfo[]>(`${environment.restApi}/user/${login}`).pipe(
      map(this.mapUserInfo.bind(this))
    );
  }

  recoverPassword(loginOrEmail: string): Observable<any> {
    const loginOrEmailInfo = this.toLoginOrEmailInfo(loginOrEmail);

    return this.http.post<UserInfo>(`${environment.restApi}/loginrecovery/`, loginOrEmailInfo);
  }

  updatePassword(newPassword: NewPassword): Observable<any> {
    const passInfo = this.toPasswordInfo(newPassword);

    return this.http.put(`${environment.restApi}/loginrecovery/password`, passInfo);
  }

  private toPasswordInfo(newPassword: NewPassword): NewPasswordInfo {
    return{
      password: newPassword.password,
      uuid: newPassword.uuid
    };
  }

  private toUserInfo(user: Users): UserInfo {
    return {
      login: user.login,
      email: user.email,
      password: user.password,
      role: user.role
    };
  }

  private mapUserInfo(userInfo: UserInfo): Users {
    return {
      login: userInfo.login,
      email: userInfo.email,
      password: userInfo.password,
      role: userInfo.role
    };
  }

  private toLoginOrEmailInfo(loginOrEmail: string): LoginOrEmailInfo {
    return {
      loginOrEmail: loginOrEmail
    };
  }
}
