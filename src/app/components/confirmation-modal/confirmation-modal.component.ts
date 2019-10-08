import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css']
})
export class ConfirmationModalComponent implements OnInit {

  @Input() title: string;
  @Input() id: string;
  @Input() message: string;
  @Input() action: string;

  @Output() cancelAction = new EventEmitter<any>();
  @Output() actionToDo = new EventEmitter<string>();

  opened = true;

  ngOnInit() {
  }

  onActionToDo(id: string) {
    this.actionToDo.emit(id);
  }

  onCancelAction() {
    this.cancelAction.emit();
  }

}
