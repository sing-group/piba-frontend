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
