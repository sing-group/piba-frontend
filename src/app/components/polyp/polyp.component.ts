import {Component, Input, OnInit} from '@angular/core';
import {Polyp, LST, NICE, PARIS, WASP} from '../../models/Polyp';
import {PolypsService} from '../../services/polyps.service';
import {Exploration} from '../../models/Exploration';
import {EnumUtils} from '../../utils/enum.utils';
import {PolypRecordingsService} from '../../services/polyprecordings.service';

@Component({
  selector: 'app-polyp',
  templateUrl: './polyp.component.html',
  styleUrls: ['./polyp.component.css']
})
export class PolypComponent implements OnInit {

  WASP = WASP;
  WASPValues: WASP[];

  NICE = NICE;
  NICEValues: NICE[];

  LST = LST;
  LSTValues: LST[];

  PARIS = PARIS;
  PARISValues: PARIS[];

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
              private  polypRecordingsService: PolypRecordingsService) {
  }

  ngOnInit() {
    const enumUtils = new EnumUtils();
    this.WASPValues = enumUtils.enumValues(WASP);
    this.NICEValues = enumUtils.enumValues(NICE);
    this.LSTValues = enumUtils.enumValues(LST);
    this.PARISValues = enumUtils.enumValues(PARIS);
    this.polyps = this.exploration.polyps;
    this.polyps.map((polyp) => {
      this.polypRecordingsService.getPolypRecordingsByPolyp(polyp.id)
        .subscribe((polypRecordings) => polyp.polypRecordings = polypRecordings);
    });


  }

  cancel() {
    this.creatingPolyp = false;
    this.editingPolyp = false;
    this.polyp = new Polyp();
  }

  save() {
    if (!this.editingPolyp) {
      this.polyp.exploration = this.exploration;
      this.polypsService.createPolyp(this.polyp).subscribe(newPolyp => this.exploration.polyps = this.exploration.polyps.concat(newPolyp));
    } else {
      this.polypsService.editPolyp(this.polyp).subscribe(updatedPolyp => {
        Object.assign(this.exploration.polyps.find((polyp) =>
          polyp.id === this.polyp.id
        ), updatedPolyp);
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


}


