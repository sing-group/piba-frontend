import {Component, OnInit} from '@angular/core';
import {NotificationService} from './modules/notification/services/notification.service';
import {Severity} from './modules/notification/entities';
import {AuthenticationService} from './services/authentication.service';
import {Router} from '@angular/router';
import {NotificationsService} from 'angular2-notifications';
import {Role} from './models/User';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'PIBA';

  role = Role;

  constructor(
    private notificationService: NotificationService,
    private notificationsService: NotificationsService,
    public authenticationService: AuthenticationService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.notificationService.getMessages().subscribe(
      message => {
        switch (message.severity) {
          case Severity.ERROR:
            this.notificationsService.error(message.summary, message.detail);
            break;
          case Severity.SUCCESS:
            this.notificationsService.success(message.summary, message.detail);
            break;
          case Severity.INFO:
            this.notificationsService.info(message.summary, message.detail);
            break;
          case Severity.WARNING:
            this.notificationsService.warn(message.summary, message.detail);
            break;
        }
      }
    );
  }

  logOut() {
    this.authenticationService.logOut();
    this.router.navigateByUrl('/login');
  }
}

