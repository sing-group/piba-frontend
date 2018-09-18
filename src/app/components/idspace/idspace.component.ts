import {Component, OnInit} from '@angular/core';
import {IdSpace} from '../../models/IdSpace';
import {IdSpacesService} from '../../services/idspaces.service';
import {NotificationService} from '../../modules/notification/services/notification.service';

@Component({
  selector: 'app-idspace',
  templateUrl: './idspace.component.html',
  styleUrls: ['./idspace.component.css']
})
export class IdspaceComponent implements OnInit {

  creatingIdSpace: Boolean = false;
  idSpace: IdSpace = new IdSpace();

  constructor(private idSpacesService: IdSpacesService, private notificationService: NotificationService) {
  }

  ngOnInit() {
  }

  save() {
    if (this.creatingIdSpace) {
      this.idSpacesService.createIdSpace(this.idSpace).subscribe(
        () =>
          this.notificationService.success('ID Space registered.', 'Id Space registered successfully.')
      );
    }
    this.cancel();
  }

  cancel() {
    this.idSpace = new IdSpace();
    this.creatingIdSpace = false;
  }

}
