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

  creatingIdSpace = false;
  editingIdSpace = false;
  deletingIdSpace = false;
  idSpace: IdSpace = new IdSpace();

  idSpaces: IdSpace[] = [];

  constructor(private idSpacesService: IdSpacesService, private notificationService: NotificationService) {
    this.idSpacesService.getIdSpaces().subscribe((idSpaces) => this.idSpaces = idSpaces);
  }

  ngOnInit() {
  }

  save() {
    if (this.creatingIdSpace) {
      this.idSpacesService.createIdSpace(this.idSpace).subscribe(
        (newIDSpace) => {
          this.idSpaces = this.idSpaces.concat(newIDSpace);
          this.notificationService.success('ID Space registered successfully.', 'ID Space registered.');
          this.cancel();
        });
    } else {
      this.idSpacesService.editIdSpace(this.idSpace).subscribe(updated => {
          Object.assign(this.idSpaces.find((idSpace) => idSpace.id === this.idSpace.id), updated);
          this.notificationService.success('ID Space edited successfully.', 'ID Space edited.');
          this.cancel();
        }
      );
    }

  }

  edit(id: string) {
    this.editingIdSpace = true;
    this.idSpace = new IdSpace();
    Object.assign(this.idSpace, this.idSpaces.find((idSpace) => idSpace.id === id));
  }

  delete(id: string) {
    this.idSpacesService.delete(id).subscribe(() => {
      const index = this.idSpaces.indexOf(
        this.idSpaces.find((idSpace) => idSpace.id === id)
      );
      this.idSpaces.splice(index, 1);
      this.notificationService.success('ID Space removed successfully.', 'ID Space removed.');
    });
    this.cancel();
  }

  remove(id: string) {
    this.deletingIdSpace = true;
    this.idSpace = this.idSpaces.find((idSpace) => idSpace.id === id);
  }

  cancel() {
    this.idSpace = new IdSpace();
    this.creatingIdSpace = false;
    this.editingIdSpace = false;
    this.deletingIdSpace = false;
  }

}
