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

  creatingUser: Boolean = false;
  user: Users = new Users();

  roles = Role;
  // to show the value of the enum
  keys = Object.keys;

  constructor(private usersServices: UsersService,
              private notificationService: NotificationService) {
  }

  ngOnInit() {
  }

  save() {
    this.usersServices.create(this.user).subscribe(() => {
      this.notificationService.success('User registered.', 'User registered successfully.');
      this.cancel();
    });
  }

  cancel() {
    this.creatingUser = false;
    this.user = new Users();
  }

}
