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

  constructor(private usersServices: UsersService,
              private notificationService: NotificationService,
              private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    if (this.authenticationService.getUser().authenticated) {
      this.usersServices.getUser(this.authenticationService.getUser().login).subscribe(user => this.loggedUser = user);
    }
  }

}
