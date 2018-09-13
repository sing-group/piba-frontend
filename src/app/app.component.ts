import {Component, OnInit} from '@angular/core';
import {NotificationService} from './modules/notification/services/notification.service';
import {Severity} from './modules/notification/entities';
import {ToastrService} from 'ngx-toastr';
import {AuthenticationService} from './services/authentication.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent implements OnInit {
  title = 'PIBA';

  constructor(
    private notification: NotificationService,
    private toastService: ToastrService,
    public authenticationService: AuthenticationService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.notification.getMessages().subscribe(
      message => {
        switch (message.severity) {
          case Severity.ERROR:
            this.toastService.error(message.summary, message.detail);
            break;
          case Severity.SUCCESS:
            this.toastService.success(message.summary, message.detail);
            break;
          case Severity.INFO:
            this.toastService.info(message.summary, message.detail);
            break;
          case Severity.WARNING:
            this.toastService.warning(message.summary, message.detail);
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

