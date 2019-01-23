import { Component, OnInit } from '@angular/core';
import {Modifier} from '../../models/Modifier';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {ModifiersService} from '../../services/modifiers.service';

@Component({
  selector: 'app-modifiers',
  templateUrl: './modifiers.component.html',
  styleUrls: ['./modifiers.component.css']
})
export class ModifiersComponent implements OnInit {

  modifiers: Modifier[] = [];

  constructor(private modifiersService: ModifiersService, private notificationService: NotificationService) {
    this.modifiersService.getModifiers().subscribe((modifiers) => this.modifiers = modifiers);
  }

  ngOnInit() {
  }

}
