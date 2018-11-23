import {Component, EventEmitter, OnInit, Input, Output} from '@angular/core';

@Component({
  selector: 'app-delete-confirmation',
  templateUrl: './delete-confirmation.component.html'
})
export class DeleteConfirmationComponent implements OnInit {
  @Input() deleting: Boolean;
  @Input() data: string;

  @Output('confirmDelete') modalEmitter = new EventEmitter<Boolean>();

  ngOnInit() {
  }

}
