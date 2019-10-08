import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'app-delete-confirmation',
  templateUrl: './delete-confirmation.component.html',
  styleUrls: ['./delete-confirmation.component.css']
})
export class DeleteConfirmationComponent implements OnInit {

  @Input() modelName: string;
  // id that is used to delete the object
  @Input() id: string;
  // identifying name that will be shown
  @Input() name: string;
  @Input() message: string;

  @Input() cancel: Function;
  @Input() delete: Function;

  opened = true;

  ngOnInit() {
    if (this.message === undefined) {
      this.message = `Are you sure you want to delete <strong>${this.name}</strong>?` +
        '<div class="warning">This action is permanent and cannot be undone.</div>';
    }
  }
}
