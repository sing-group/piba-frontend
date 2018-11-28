import {Component, OnInit} from '@angular/core';
import {Role} from '../../models/User';
import {UsersService} from '../../services/users.service';
import {Users} from '../../models/Users';
import {NotificationService} from '../../modules/notification/services/notification.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  creatingUser = false;
  editingUser = false;
  deletingUser = false;
  user: Users = new Users();
  confirmPassword: string;

  roles = Role;
  // to show the value of the enum
  keys = Object.keys;

  users: Users[] = [];

  constructor(private usersServices: UsersService,
              private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.usersServices.getUsers().subscribe(users => this.users = users);
  }

  save() {
    if (this.creatingUser) {
      this.usersServices.create(this.user).subscribe((newUser) => {
        this.users = this.users.concat(newUser);
        this.notificationService.success('User registered successfully.', 'User registered.');
      });
    } else {
      this.usersServices.editUser(this.user).subscribe(updated => {
        Object.assign(this.users.find((user) => user.login === this.user.login), updated);
        this.notificationService.success('User edited successfully.', 'User edited.');
      });
    }
    this.cancel();
  }

  cancel() {
    this.creatingUser = false;
    this.editingUser = false;
    this.deletingUser = false;
    this.user = new Users();
  }

  edit(login: string) {
    this.editingUser = true;
    this.user = this.users.find((user) => user.login === login);
    // to not show the password in the editing modal
    this.user.password = '';
  }

  delete(login: string) {
    this.usersServices.deleteUser(login).subscribe(() => {
      const index = this.users.indexOf(
        this.users.find((user) => user.login === login)
      );
      this.users.splice(index, 1);
      this.notificationService.success('User removed successfully.', 'User removed.');
    });
    this.cancel();
  }

  remove(login: string) {
    this.deletingUser = true;
    this.user = this.users.find((user) => user.login === login);
  }
}
