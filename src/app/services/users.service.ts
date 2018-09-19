import {Injectable} from '@angular/core';
import {Users} from '../models/Users';
import {Observable} from 'rxjs';
import {UserInfo} from './entities/UserInfo';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';

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

  private toUserInfo(user: Users): UserInfo {
    return {
      login: user.login,
      password: user.password,
      role: user.role
    };
  }

  private mapUserInfo(userInfo: UserInfo): Users {
    return {
      login: userInfo.login,
      password: userInfo.password,
      role: userInfo.role
    };
  }
}
