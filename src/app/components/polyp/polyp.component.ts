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

  polyp: Polyp = new Polyp();
  polypType: PolypType = null;
  // to check if name is used in the edition
  polypName: String;

  currentTime: number;

  pauseWatcher: any [] = [];

  @Input() exploration: Exploration;
  polyps: Polyp[];

  constructor(private polypsService: PolypsService,
              private  polypRecordingsService: PolypRecordingsService,
              private notificationService: NotificationService) {
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
    this.polyps = this.exploration.polyps;
    this.assignPolypName();
    this.polyps.map((polyp) => {
      this.polypRecordingsService.getPolypRecordingsByPolyp(polyp.id)
        .subscribe((polypRecordings) => polyp.polypRecordings = polypRecordings);
    });
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

  public isAdenoma(histology: PolypHistology): histology is Adenoma {
    return isAdenoma(histology);
  }

  public asAdenoma(histology: PolypHistology): Adenoma {
    if (isAdenoma(histology)) {
      return histology;
    }
  }

  public isSSA(histology: PolypHistology): histology is SSA {
    return isSSA(histology);
  }

  public asSSA(histology: PolypHistology): SSA {
    if (isSSA(histology)) {
      return histology;
    }
  }

  public isTSA(histology: PolypHistology): histology is TSA {
    return isTSA(histology);
  }

  public asTSA(histology: PolypHistology): TSA {
    if (isTSA(histology)) {
      return histology;
    }
  }

  cancel() {
    this.creatingPolyp = false;
    this.editingPolyp = false;
    this.deletingPolyp = false;
    this.polyp = new Polyp();
    this.polypType = null;
    this.polypName = '';
    this.assignPolypName();
  }

  save() {
    this.polyp.exploration = this.exploration;
    if (this.creatingPolyp) {
      this.polypsService.createPolyp(this.polyp).subscribe(newPolyp => {
          this.exploration.polyps = this.exploration.polyps.concat(newPolyp);
          this.assignPolypName();
          this.notificationService.success('Polyp registered successfully.', 'Polyp registered.');
          this.cancel();
        }
      );
    } else {
      this.polypsService.editPolyp(this.polyp).subscribe(updatedPolyp => {
        Object.assign(this.exploration.polyps.find((polyp) => {
            return polyp.id === this.polyp.id;
          }
        ), updatedPolyp);
        this.notificationService.success('Polyp edited successfully.', 'Polyp edited.');
        this.cancel();
      });
    }
  }

  nameIsUsed(): Boolean {
    if (this.creatingPolyp) {
      return this.polyps.find((polyp) => polyp.name === this.polyp.name) !== undefined;
    } else {
      return this.polyps.find((polyp) => polyp.name === this.polyp.name) !== undefined && this.polyp.name !== this.polypName;
    }
  }

  editPolyp(id: string) {
    this.editingPolyp = true;
    this.polyp = new Polyp();
    Object.assign(this.polyp, this.exploration.polyps.find(polyp => polyp.id === id));
    this.polypName = this.polyp.name;
    this.polypType = this.polyp.histology.polypType;
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

  private assignPolypName() {
    this.polyp.name = 'Polyp ' + (this.exploration.polyps.length + 1);
  }

}


