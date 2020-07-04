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

import {Component, Input, OnInit} from '@angular/core';
import {LOCATION, LST, NICE, PARIS, Polyp, WASP} from '../../models/Polyp';
import {PolypsService} from '../../services/polyps.service';
import {Exploration} from '../../models/Exploration';
import {EnumUtils} from '../../utils/enum.utils';
import {PolypRecordingsService} from '../../services/polyprecordings.service';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {
  Adenoma,
  AdenomaDysplasingGrade,
  AdenomaType,
  Hyperplastic,
  Invasive,
  isAdenoma,
  isSSA,
  isTSA, NoHistology, NonEpithelialNeoplastic,
  PolypHistology,
  PolypType,
  SSA,
  SsaDysplasingGrade,
  TSA,
  TsaDysplasingGrade
} from '../../models/PolypHistology';
import {PolypRecording} from '../../models/PolypRecording';
import {Role} from '../../models/User';
import {AuthenticationService} from '../../services/authentication.service';

@Component({
  selector: 'app-polyp',
  templateUrl: './polyp.component.html',
  styleUrls: ['./polyp.component.css']
})
export class PolypComponent implements OnInit {

  WASPValues: WASP[];
  NICEValues: NICE[];
  LSTValues: LST[];
  PARISValues: PARIS[];
  LOCATIONValues: LOCATION[];

  POLYPTYPEValues: PolypType[];
  ADENOMAValues: AdenomaType[];
  ADENOMADYSPLASINGValues: AdenomaDysplasingGrade[];
  SSADYSPLASINGGRADEValues: SsaDysplasingGrade[];
  TSADYSPLASINGGRADEValues: TsaDysplasingGrade[];

  creatingPolyp = false;
  editingPolyp = false;
  deletingPolyp = false;
  confirmingPolyp = false;

  polyp: Polyp = new Polyp();
  polypType: PolypType = null;

  currentTime: number;
  pauseWatcher: any [] = [];

  polyps: Polyp[];

  @Input() set exploration(exploration: Exploration) {
    this._exploration = exploration;
    this.polyps = this.exploration.polyps;
    this.polyps.map((polyp) => {
      this.polypRecordingsService.listPolypRecordingsByPolyp(polyp.id)
        .subscribe((polypRecordings) => polyp.polypRecordings = polypRecordings);
    });
  }

  get exploration() {
    return this._exploration;
  }

  private _exploration: Exploration;
  private polypName: String;

  constructor(private polypsService: PolypsService,
              private  polypRecordingsService: PolypRecordingsService,
              private notificationService: NotificationService,
              private readonly authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.WASPValues = EnumUtils.enumValues(WASP);
    this.NICEValues = EnumUtils.enumValues(NICE);
    this.LSTValues = EnumUtils.enumValues(LST);
    this.PARISValues = EnumUtils.enumValues(PARIS);
    this.LOCATIONValues = EnumUtils.enumValues(LOCATION);
    this.POLYPTYPEValues = EnumUtils.enumValues(PolypType);
    this.ADENOMAValues = EnumUtils.enumValues(AdenomaType);
    this.ADENOMADYSPLASINGValues = EnumUtils.enumValues(AdenomaDysplasingGrade);
    this.SSADYSPLASINGGRADEValues = EnumUtils.enumValues(SsaDysplasingGrade);
    this.TSADYSPLASINGGRADEValues = EnumUtils.enumValues(TsaDysplasingGrade);
    this.assignPolypName();
  }

  public onPolypTypeChange(polypType: PolypType) {
    switch (polypType) {
      case PolypType.ADENOMA:
        this.polyp.histology = new Adenoma(null, null);
        break;
      case PolypType.INVASIVE:
        this.polyp.histology = new Invasive();
        break;
      case PolypType.HYPERPLASTIC:
        this.polyp.histology = new Hyperplastic();
        break;
      case PolypType.SESSILE_SERRATED_ADENOMA:
        this.polyp.histology = new SSA(null);
        break;
      case PolypType.TRADITIONAL_SERRATED_ADENOMA:
        this.polyp.histology = new TSA(null);
        break;
      case PolypType.NON_EPITHELIAL_NEOPLASTIC:
        this.polyp.histology = new NonEpithelialNeoplastic();
        break;
      case PolypType.NO_HISTOLOGY:
        this.polyp.histology = new NoHistology();
        break;
    }
  }

  isAdenoma(histology: PolypHistology): histology is Adenoma {
    return isAdenoma(histology);
  }

  asAdenoma(histology: PolypHistology): Adenoma {
    if (isAdenoma(histology)) {
      return histology;
    }
  }

  isSSA(histology: PolypHistology): histology is SSA {
    return isSSA(histology);
  }

  asSSA(histology: PolypHistology): SSA {
    if (isSSA(histology)) {
      return histology;
    }
  }

  isTSA(histology: PolypHistology): histology is TSA {
    return isTSA(histology);
  }

  asTSA(histology: PolypHistology): TSA {
    if (isTSA(histology)) {
      return histology;
    }
  }

  cancel() {
    this.creatingPolyp = false;
    this.editingPolyp = false;
    this.deletingPolyp = false;
    this.confirmingPolyp = false;
    this.polyp = new Polyp();
    this.polypType = null;
    this.polypName = '';
    this.assignPolypName();
  }

  save() {
    this.polyp.exploration = this.exploration;
    if (this.creatingPolyp) {
      if (this.exploration.confirmed) {
        throw Error('Polyps can\'t be added to confirmed explorations');
      }

      this.polypsService.createPolyp(this.polyp).subscribe(newPolyp => {
          this.exploration.polyps = this.exploration.polyps.concat(newPolyp);
          this.assignPolypName();
          this.notificationService.success('Polyp registered successfully.', 'Polyp registered.');
          this.cancel();
        }
      );
    } else {
      this.polypsService.editPolyp(this.polyp).subscribe(updatedPolyp => {
        this.polypRecordingsService.listPolypRecordingsByPolyp(updatedPolyp.id)
          .subscribe((polypRecordings) => {
            updatedPolyp.polypRecordings = polypRecordings;
            Object.assign(this.exploration.polyps.find((polyp) => {
                return polyp.id === updatedPolyp.id;
              }
            ), updatedPolyp);
            this.notificationService.success('Polyp edited successfully.', 'Polyp edited.');
            this.cancel();
          });
      });
    }
  }

  isNameUsed(): boolean {
    if (this.creatingPolyp) {
      return this.polyps.find((polyp) => polyp.name === this.polyp.name) !== undefined;
    } else {
      return this.polyps.find((polyp) => polyp.name === this.polyp.name) !== undefined && this.polyp.name !== this.polypName;
    }
  }

  editPolyp(id: string) {
    this.editingPolyp = !this.confirmingPolyp;
    this.polyp = new Polyp();
    Object.assign(this.polyp, this.exploration.polyps.find(polyp => polyp.id === id));
    this.polypName = this.polyp.name;
    this.polypType = this.polyp.histology.polypType;
    this.polyp.confirmed = this.polyp.confirmed !== true ? this.confirmingPolyp : true;
  }

  confirmPolyp(id: string) {
    this.confirmingPolyp = true;
    this.editPolyp(id);
  }

  delete(id: string) {
    this.polypsService.delete(id).subscribe(() => {
        const index = this.exploration.polyps.indexOf(
          this.exploration.polyps.find((polyp) => polyp.id === id
          )
        );
        this.exploration.polyps.splice(index, 1);
        this.assignPolypName();
        this.notificationService.success('Polyp removed successfully.', 'Polyp removed.');
      }
    );
    this.cancel();
  }

  remove(id: string) {
    this.deletingPolyp = true;
    this.polyp = this.exploration.polyps.find(polyp => polyp.id === id);
  }

  playVideo(polypRecording: PolypRecording) {
    const videoHTML = document.getElementById(String(polypRecording.id)) as HTMLMediaElement;
    if (this.pauseWatcher[polypRecording.id] !== undefined && this.pauseWatcher[polypRecording.id] != null) {
      clearInterval(this.pauseWatcher[polypRecording.id]);
    }
    this.pauseWatcher[polypRecording.id] = setInterval(() => {
      if (videoHTML.currentTime >= polypRecording.end) {
        videoHTML.currentTime = polypRecording.end;
        this.pauseVideo(polypRecording);
      }
    }, 500);

    videoHTML.currentTime = polypRecording.start;
    videoHTML.play();

    const controls = document.getElementById('controls-' + polypRecording.id);
    controls.style.display = 'none';
  }

  pauseVideo(polypRecording: PolypRecording) {
    const videoHTML = document.getElementById(String(polypRecording.id)) as HTMLMediaElement;
    videoHTML.pause();
    const controls = document.getElementById('controls-' + polypRecording.id);
    controls.style.display = 'flex';
    if (this.pauseWatcher[polypRecording.id] != null) {
      clearInterval(this.pauseWatcher[polypRecording.id]);
    }
  }

  isEndoscopist(): boolean {
    return this.authenticationService.getRole() === Role.ENDOSCOPIST;
  }

  private assignPolypName() {
    this.polyp.name = 'Polyp ' + (this.exploration.polyps.length + 1);
  }

}


