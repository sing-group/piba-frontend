import {Component, OnInit} from '@angular/core';
import {Modifier} from '../../models/Modifier';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {ModifiersService} from '../../services/modifiers.service';

@Component({
  selector: 'app-modifiers',
  templateUrl: './modifiers.component.html',
  styleUrls: ['./modifiers.component.css']
})
export class ModifiersComponent implements OnInit {

  creatingModifier = false;
  deletingModifier = false;
  modifier: Modifier = new Modifier();

  modifiers: Modifier[] = [];

  constructor(private modifiersService: ModifiersService, private notificationService: NotificationService) {
    this.modifiersService.getModifiers().subscribe((modifiers) => this.modifiers = modifiers);
  }

  ngOnInit() {
  }

  save() {
    this.modifiersService.createModifier(this.modifier).subscribe(
      (newModifier) => {
        this.modifiers = this.modifiers.concat(newModifier);
        this.notificationService.success('Modifier registered successfully.', 'Modifier registered.');
        this.cancel();
      });
  }

  delete(id: string) {
    this.modifiersService.deleteModifier(id).subscribe(() => {
      const index = this.modifiers.indexOf(
        this.modifiers.find((modifier) => modifier.id === id)
      );
      this.modifiers.splice(index, 1);
      this.notificationService.success('Modifier removed successfully.', 'Modifier removed.');
    });
    this.cancel();
  }

  remove(id: string) {
    this.deletingModifier = true;
    this.modifier = this.modifiers.find((modifier) => modifier.id === id);
  }

  cancel() {
    this.modifier = new Modifier();
    this.creatingModifier = false;
    this.deletingModifier = false;
  }

}