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
  Invasive, isAdenoma, isSSA, isTSA,
  PolypHistology,
  PolypType,
  SSA,
  SsaDysplasingGrade,
  TSA,
  TsaDysplasingGrade
} from '../../models/PolypHistology';

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

  currentTime: number;
  videoHTML: HTMLMediaElement;
  controls: HTMLElement;

  pauseWatcher: any;

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
    this.assignPolypName();
  }

  save() {
    this.polyp.exploration = this.exploration;
    if (this.creatingPolyp) {
      this.polypsService.createPolyp(this.polyp).subscribe(newPolyp => {
          this.exploration.polyps = this.exploration.polyps.concat(newPolyp);
          this.assignPolypName();
          this.notificationService.success('Polyp registered successfully.', 'Polyp registered.');
        }
      );
    } else {
      this.polypsService.editPolyp(this.polyp).subscribe(updatedPolyp => {
        Object.assign(this.exploration.polyps.find((polyp) => {
            return polyp.id === this.polyp.id;
          }
        ), updatedPolyp);
        this.notificationService.success('Polyp edited successfully.', 'Polyp edited.');
      });
    }
    this.cancel();
  }

  editPolyp(id: string) {
    this.editingPolyp = true;
    this.polyp = this.exploration.polyps.find(polyp => polyp.id === id);
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

  playVideo(videoId: string, polypId: string) {
    const indexPolyp = this.polyps.indexOf(this.polyps.find((polyp) => polyp.id === polypId));
    const indexVideo = this.polyps[indexPolyp].polypRecordings.indexOf(
      this.polyps[indexPolyp].polypRecordings.find(polypRecording => polypRecording.video.id === videoId)
    );

    this.videoHTML = document.getElementById(videoId + '-' + polypId) as HTMLMediaElement;
    this.pauseWatcher = setInterval(() => {

      if (this.videoHTML.currentTime >= this.polyps[indexPolyp].polypRecordings[indexVideo].end) {

        this.videoHTML.currentTime = this.polyps[indexPolyp].polypRecordings[indexVideo].end;
        this.pauseVideo(videoId, polypId);
      }
    }, 500);


    this.videoHTML.currentTime = this.polyps[indexPolyp].polypRecordings[indexVideo].start;
    this.videoHTML.play();

    this.controls = document.getElementById('controls-' + videoId + '-' + polypId);
    this.controls.style.display = 'none';

  }

  pauseVideo(videoId: string, polypId: string) {
    this.videoHTML = document.getElementById(videoId + '-' + polypId) as HTMLMediaElement;
    this.videoHTML.pause();
    this.controls = document.getElementById('controls-' + videoId + '-' + polypId);
    this.controls.style.display = 'flex';
    if (this.pauseWatcher != null) {
      clearInterval(this.pauseWatcher);
    }
  }

  private assignPolypName() {
    this.polyp.name = 'Polyp ' + (this.exploration.polyps.length + 1);
  }

}


