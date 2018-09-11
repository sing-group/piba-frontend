import {Component, OnInit} from '@angular/core';
import {NotificationService} from './modules/notification/services/notification.service';
import {Severity} from './modules/notification/entities';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent implements OnInit {
  title = 'PIBA';

  constructor(
    private notification: NotificationService,
    private toastService: ToastrService
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
}

