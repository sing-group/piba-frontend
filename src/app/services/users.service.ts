import {Injectable} from '@angular/core';
import {Users} from '../models/Users';
import {Observable} from 'rxjs';
import {UserInfo} from './entities/UserInfo';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {User} from '../models/User';

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

  recoverPassword(loginOrEmail: string) {
    const user = {
      loginOrEmail: loginOrEmail
    };

    return this.http.post<UserInfo>(`${environment.restApi}/loginrecovery/`, user).subscribe();
  }

  updatePassword(password: string, uuid: string): Observable<any> {
    const passInfo = {
      uuid: uuid,
      password: password
    };

    return this.http.put(`${environment.restApi}/loginrecovery/password`, passInfo);
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
}
