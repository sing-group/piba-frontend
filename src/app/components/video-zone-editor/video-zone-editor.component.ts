import {Component, DoCheck, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ClrDatagridSortOrder} from '@clr/angular';
import {ElementInVideoZone} from '../../models/ElementInVideoZone';
import {VideoZoneType} from '../../models/VideoZoneType';
import {Interval} from '../../models/Interval';
import {TimeToNumberPipe} from '../../pipes/time-to-number.pipe';
import {NgModel} from '@angular/forms';

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

  @ViewChild('nameElement') elementNameInForm: NgModel;

  private _creationModalOpened = false;

  ascSort = ClrDatagridSortOrder.ASC;

  creationModalSubmitted = false;
  selectedZoneType: VideoZoneType;
  selectedElement: ElementInVideoZone;
  deleting = false;

  newZoneTypeName = '';
  name: string;
  start: string;
  end: string;

  constructor(
    private timeToNumber: TimeToNumberPipe
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
      element: this.selectedZoneType
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
    this.deleting = false;
    this.selectedZoneType = null;
    this.start = null;
    this.end = null;
  }
}
