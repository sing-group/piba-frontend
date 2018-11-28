import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'app-delete-confirmation',
  templateUrl: './delete-confirmation.component.html'
})
export class DeleteConfirmationComponent implements OnInit {

  @Input() modelName: string;
  // id that is used to delete the object
  @Input() id: string;
  // identifying name that will be shown
  @Input() name: string;

  @Input() cancel: Function;
  @Input() delete: Function;

  opened = true;

  ngOnInit() {
  }

}
