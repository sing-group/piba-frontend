import {Component, OnInit} from '@angular/core';
import {UsersService} from '../../services/users.service';
import {Users} from '../../models/Users';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {AuthenticationService} from '../../services/authentication.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  loggedUser: Users = new Users();
  password: string;
  confirmPassword: string;
  editingUser = false;

  constructor(private usersService: UsersService,
              private notificationService: NotificationService,
              private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    if (this.authenticationService.getUser().authenticated) {
      this.usersService.getUser(this.authenticationService.getUser().login).subscribe(user => this.loggedUser = user);
    }
  }

  edit() {
    this.editingUser = true;
    // to not show the password in the edition
    this.loggedUser.password = '';
  }

  editUser() {
    this.usersService.editUser(this.loggedUser).subscribe(updatedUser => {
      this.editingUser = false;
      if (this.loggedUser.password !== '') {
        this.authenticationService.logOut();
        this.authenticationService.logIn(this.loggedUser.login, this.loggedUser.password, this.loggedUser.role);
      }
      Object.assign(this.loggedUser, updatedUser);
      this.confirmPassword = '';
      this.notificationService.success('User edited successfully.', 'User edited.');
    });
  }
}
