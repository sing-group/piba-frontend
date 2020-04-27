/*
 *  PIBA Frontend
 *
 * Copyright (C) 2018-2020 - Miguel Reboiro-Jato,
 * Daniel Glez-Peña, Alba Nogueira Rodríguez, Florentino Fdez-Riverola,
 * Rubén Domínguez Carbajales, Jesús Miguel Herrero Rivas,
 * Eloy Sánchez Hernández, Laura Rivas Moral,
 * Manuel Puga Jiménez de Azcárate, Joaquín Cubiella Fernández,
 * Hugo López-Fernández, Silvia Rodríguez Iglesias, Fernando Campos Tato.
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {Component, DoCheck, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ClrDatagridSortOrder} from '@clr/angular';
import {ElementInVideoZone} from '../../models/ElementInVideoZone';
import {VideoZoneType} from '../../models/VideoZoneType';
import {Interval} from '../../models/Interval';
import {TimeToNumberPipe} from '../../pipes/time-to-number.pipe';
import {NgModel} from '@angular/forms';
import {Role} from '../../models/User';
import {AuthenticationService} from '../../services/authentication.service';

@Component({
  selector: 'app-video-zone-editor',
  templateUrl: './video-zone-editor.component.html',
  styleUrls: ['./video-zone-editor.component.css']
})
export class VideoZoneEditorComponent implements DoCheck {

  @Input() elementName: string;
  @Input() elements: ElementInVideoZone[];
  @Input() videoZoneTypes: VideoZoneType[];
  @Input() canBeCreated: boolean;
  @Input() isValidInterval: (interval: Interval) => boolean;
  @Input() getCurrentTimeStart: () => string;
  @Input() getCurrentTimeEnd: () => string;

  @Output() playInterval = new EventEmitter<Interval>();
  @Output() addZoneType = new EventEmitter<string>();
  @Output() createElement = new EventEmitter<ElementInVideoZone>();
  @Output() removeElement = new EventEmitter<number>();
  @Output() confirmElement = new EventEmitter<number>();
  @Output() confirmAllElements = new EventEmitter<any>();

  @ViewChild('nameElement') elementNameInForm: NgModel;

  private _creationModalOpened = false;

  ascSort = ClrDatagridSortOrder.ASC;

  creationModalSubmitted = false;
  selectedZoneType: VideoZoneType;
  selectedElement: ElementInVideoZone;
  deleting = false;
  confirmingElementInVideoZone = false;
  confirmingAllElements = false;

  newZoneTypeName = '';
  name: string;
  start: string;
  end: string;

  constructor(
    private timeToNumber: TimeToNumberPipe,
    private readonly authenticationService: AuthenticationService
  ) {
  }

  ngDoCheck() {
    if (this.newZoneTypeName !== '') {
      const newZoneType = this.videoZoneTypes.find(zoneType => zoneType.name === this.newZoneTypeName);
      if (newZoneType !== undefined && this.creationModalSubmitted) {
        this.selectedZoneType = newZoneType;
        this.newZoneTypeName = '';
        this.creationModalSubmitted = false;
      }
    }
  }

  get creationModalOpened() {
    return this._creationModalOpened;
  }

  set creationModalOpened(value: boolean) {
    this._creationModalOpened = value;
    if (!this.creationModalSubmitted) {
      this.newZoneTypeName = '';
    }
    this.elementNameInForm.control.markAsPristine();
  }

  get sortedVideoZoneTypes(): VideoZoneType[] {
    return this.videoZoneTypes.sort((typeA: VideoZoneType, typeB: VideoZoneType) => typeA.name < typeB.name ? -1 : 1);
  }

  onCreateZone() {
    this.createElement.emit({
      id: -1,
      start: this.timeToNumber.transform(this.start),
      end: this.timeToNumber.transform(this.end),
      element: this.selectedZoneType,
      confirmed: false
    });

    this.clearCreationForm();
  }

  onPlayInterval(interval: Interval) {
    this.playInterval.emit(interval);
  }

  onShowCreationDialog() {
    this.creationModalOpened = true;
  }

  onCreateElement() {
    this.addZoneType.emit(this.newZoneTypeName);
    this.creationModalSubmitted = true;
    this.creationModalOpened = false;
  }

  onShowRemoveDialog(element: ElementInVideoZone) {
    this.deleting = true;
    this.selectedElement = element;
  }

  onShowConfirmElementDialog(element: ElementInVideoZone) {
    this.confirmingElementInVideoZone = true;
    this.selectedElement = element;
  }

  onShowConfirmElementsDialog() {
    this.confirmingAllElements = true;
  }

  onConfirmElement() {
    this.confirmElement.emit(this.selectedElement.id);
    this.selectedElement = null;
    this.confirmingElementInVideoZone = false;
  }

  onConfirmAllElements() {
    this.confirmAllElements.emit();
    this.confirmingAllElements = false;
  }

  onDeleteElement() {
    this.removeElement.emit(this.selectedElement.id);
    this.selectedElement = null;
    this.deleting = false;
  }

  onSetCurrentAsStart() {
    this.start = this.getCurrentTimeStart();
  }

  onSetCurrentAsEnd() {
    this.end = this.getCurrentTimeEnd();
  }

  isNameAlreadyUsed(): boolean {
    return this.videoZoneTypes !== undefined
      && this.videoZoneTypes.find(element => element.name === this.newZoneTypeName) !== undefined;
  }

  isCurrentIntervalValid(): boolean {
    if (!TimeToNumberPipe.isValidTime(this.start) || !TimeToNumberPipe.isValidTime(this.end)) {
      return false;
    }

    return this.isValidInterval({
      start: this.timeToNumber.transform(this.start),
      end: this.timeToNumber.transform(this.end)
    });
  }

  clearCreationForm() {
    this.confirmingElementInVideoZone = false;
    this.confirmingAllElements = false;
    this.deleting = false;
    this.selectedZoneType = null;
    this.start = null;
    this.end = null;
  }

  areAllElementsConfirmed(): boolean {
    return this.elements.find(element => element.confirmed === false) === undefined;
  }

  isEndoscopist(): boolean {
    return this.authenticationService.getRole() === Role.ENDOSCOPIST;
  }
}
