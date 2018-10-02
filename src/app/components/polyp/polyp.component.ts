import {Component, Input, OnInit} from '@angular/core';
import {Polyp, LST, NICE, PARIS, WASP, LOCATION} from '../../models/Polyp';
import {PolypsService} from '../../services/polyps.service';
import {Exploration} from '../../models/Exploration';
import {EnumUtils} from '../../utils/enum.utils';
import {PolypRecordingsService} from '../../services/polyprecordings.service';
import {NotificationService} from '../../modules/notification/services/notification.service';

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

  creatingPolyp: Boolean = false;
  editingPolyp: Boolean = false;

  polyp: Polyp = new Polyp();
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
    this.polyps = this.exploration.polyps;
    this.assignPolypName();
    this.polyps.map((polyp) => {
      this.polypRecordingsService.getPolypRecordingsByPolyp(polyp.id)
        .subscribe((polypRecordings) => polyp.polypRecordings = polypRecordings);
    });
  }

  cancel() {
    this.creatingPolyp = false;
    this.editingPolyp = false;
    this.polyp = new Polyp();
    this.assignPolypName();
  }

  save() {
    this.polyp.exploration = this.exploration;
    if (!this.editingPolyp) {
      this.polypsService.createPolyp(this.polyp).subscribe(newPolyp => {
          this.exploration.polyps = this.exploration.polyps.concat(newPolyp);
          this.assignPolypName();
          this.notificationService.success('Polyp registered successfully.', 'Polyp registered.');
        }
      );
    } else {
      this.polypsService.editPolyp(this.polyp).subscribe(updatedPolyp => {
        Object.assign(this.exploration.polyps.find((polyp) =>
          polyp.id === this.polyp.id
        ), updatedPolyp);
        this.notificationService.success('Polyp edited successfully.', 'Polyp edited.');
      });
    }
    this.cancel();
  }

  editPolyp(id: string) {
    this.editingPolyp = true;
    this.polyp = this.exploration.polyps.find(polyp => polyp.id === id);
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


