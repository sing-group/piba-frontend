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
