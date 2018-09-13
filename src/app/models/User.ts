export class User {
  private _login: string;
  private _password: string;
  private _role: Role;
  private _authHeader: string;
  private _authenticated: boolean;

  constructor() {
    const user: User = JSON.parse(localStorage.getItem('currentUser'));
    if (user != null) {
      this._role = user._role;
      this._login = user._login;
      this._password = user._password;
      this._authenticated = user._authenticated;
      this._authHeader = user._authHeader;
    } else {
      this._authenticated = false;
      this._role = Role.GUEST;
    }
  }

  get authHeader(): string {
    return this._authHeader;
  }

  set authHeader(value: string) {
    this._authHeader = value;
  }

  get authenticated(): boolean {
    return this._authenticated;
  }

  set authenticated(value: boolean) {
    this._authenticated = value;
  }

  get role(): Role {
    return this._role;
  }

  set role(value: Role) {
    this._role = value;
  }

  get login(): string {
    return this._login;
  }

  set login(value: string) {
    this._login = value;
  }

  get password(): string {
    return this._password;
  }

  set password(value: string) {
    this._password = value;
  }

  public save() {
    localStorage.setItem('currentUser', JSON.stringify(this));
  }

  public clear() {
    localStorage.removeItem('currentUser');
  }

}

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}
