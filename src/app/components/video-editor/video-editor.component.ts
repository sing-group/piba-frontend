import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Polyp from '../../models/Polyp';
import Video from '../../models/Video';
import { VideosService } from '../../services/videos.service';
import { TimePipe } from '../../pipes/time.pipe';
import { PolypsService } from '../../services/polyps.service';
import { ExplorationsService } from '../../services/explorations.service';
import { PolypRecordingsService } from '../../services/polyprecordings.service';
import PolypRecording from '../../models/PolypRecording';

@Component({
  selector: 'app-video-editor',
  templateUrl: './video-editor.component.html',
  styleUrls: ['./video-editor.component.css']
})
export class VideoEditorComponent implements OnInit {

  video: Video;

  start: String;
  end: String;

  newPolyp: Polyp = new Polyp();
  polyps: Polyp[];
  selectedPolyp: Polyp;

  newPolypRecording: PolypRecording;

  currentTime: number;

  modalOpened = false;

  constructor(
    private videosService: VideosService,
    private route: ActivatedRoute,
    private timePipe: TimePipe,
    private polysService: PolypsService,
    private explorationsService: ExplorationsService,
    private polypRecordingsService: PolypRecordingsService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    this.videosService.getVideo(id)
      .subscribe(video => {
        this.video = video;
        this.explorationsService.getPolyps(this.video.exploration_id).subscribe(polyps => this.polyps = polyps);
        this.polypRecordingsService.getPolypRecordings(video.id).subscribe(polypRecordings => {
          this.video.polypRecording = polypRecordings;
          polypRecordings.map(polypRecording =>
            this.deleteSelectedPolyp(polypRecording.polyp.name));
        }
        );
      });
  }

  startPolyp() {
    if (this.currentTime == undefined) {
      this.start = this.timePipe.transform(0);
    } else {
      this.start = this.timePipe.transform(this.currentTime);
    }
  }

  endPolyp() {
    if (this.currentTime == undefined) {
      this.end = this.timePipe.transform(0);
    } else {
      this.end = this.timePipe.transform(this.currentTime);
    }
  }

  onCurrentTimeUpdate(time: number) {
    this.currentTime = time;
  }

  public timesAreCorrect(): Boolean {
    if (this.start == undefined || this.end == undefined) return true;
    return (this.timeToNumber(this.start) < this.timeToNumber(this.end));
  }

  addPolyp() {
    this.explorationsService.getExploration(this.video.exploration_id).subscribe(exploration => {
      this.newPolyp.exploration = exploration;
      this.polysService.createPolyp(this.newPolyp).subscribe(polyp => {
        this.polyps.push(polyp);
        this.newPolyp = new Polyp();
      });
    });
    this.modalOpened = false;
  }

  addPolypRecording() {
    this.newPolypRecording = {
      video: this.video,
      polyp: this.selectedPolyp,
      start: this.timeToNumber(this.start),
      end: this.timeToNumber(this.end)
    }
    this.polypRecordingsService.createPolypRecording(this.newPolypRecording)
      .subscribe(
        newPolypRecording => {
          this.video.polypRecording = this.video.polypRecording.concat(newPolypRecording);
          this.start = null;
          this.end = null;
          this.deleteSelectedPolyp(this.selectedPolyp.name);
          this.selectedPolyp = null;
        }
      );

  }

  private timeToNumber(time: String): number {
    let split = time.split(':');
    let minutes = split[0];
    let seconds = split[1];
    return (parseInt(minutes) * 60 + parseInt(seconds));
  }

  private deleteSelectedPolyp(namePolyp: string) {
    let polypRemove = this.polyps.indexOf(
      this.polyps.find((polyp) => polyp.name == namePolyp)
    );
    if (polypRemove > -1) {
      this.polyps.splice(polypRemove, 1);
    }
  }

  removePolypRecording(polypRecording: PolypRecording) {
    this.polypRecordingsService.removePolypRecording(polypRecording).subscribe(() => {
      this.polyps.push(polypRecording.polyp);
      let index = this.video.polypRecording.indexOf(this.video.polypRecording.find((polypRecordingFind) => polypRecordingFind == polypRecording));
      this.video.polypRecording.splice(index, 1);
    }
    );
  }
}
