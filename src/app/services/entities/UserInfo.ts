import {Role} from '../../models/User';

export class UserInfo {
  login: string;
  email: string;
  password: string;
  role: Role;
}
