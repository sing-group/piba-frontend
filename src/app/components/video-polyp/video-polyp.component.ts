import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Video} from '../../models/Video';
import {Polyp} from '../../models/Polyp';
import {PolypRecording} from '../../models/PolypRecording';
import {TimeToNumberPipe} from '../../pipes/time-to-number.pipe';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {TimePipe} from '../../pipes/time.pipe';
import {VideosService} from '../../services/videos.service';
import {PolypsService} from '../../services/polyps.service';
import {ExplorationsService} from '../../services/explorations.service';
import {PolypRecordingsService} from '../../services/polyprecordings.service';
import {GalleriesService} from '../../services/galleries.service';
import {ImagesService} from '../../services/images.service';
import {ClrDatagridSortOrder} from '@clr/angular';

@Component({
  selector: 'app-video-polyp',
  templateUrl: './video-polyp.component.html',
  styleUrls: ['./video-polyp.component.css']
})
export class VideoPolypComponent implements OnInit {

  @Input() video: Video;
  @Input() currentTime: number;
  @Input() moveProgress: boolean;
  @Input() timesAreCorrect: Function;
  @Input() playInterval: Function;
  @Input() startInterval: Function;
  @Input() endInterval: Function;
  @Input() transformToTimePipe: Function;

  start: string;
  end: string;

  ascSort = ClrDatagridSortOrder.ASC;

  polyps: Polyp[];
  selectedPolyp: Polyp;
  newPolyp: Polyp = new Polyp();

  deletingPolypRecording = false;
  modalOpened = false;

  polypRecording: PolypRecording;

  constructor(
    private videosService: VideosService,
    private polypsService: PolypsService,
    private explorationsService: ExplorationsService,
    private polypRecordingsService: PolypRecordingsService,
    private galleriesService: GalleriesService,
    private imagesService: ImagesService,
    private timePipe: TimePipe,
    private timeToNumber: TimeToNumberPipe,
    private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.explorationsService.getPolyps(this.video.exploration).subscribe(polyps => this.polyps = polyps);
    this.polypRecordingsService.getPolypRecordingsByVideo(this.video.id).subscribe(polypRecordings => {
        this.video.polypRecording = polypRecordings;
      }
    );
  }

  addPolyp() {
    this.explorationsService.getExploration(this.video.exploration).subscribe(exploration => {
      this.newPolyp.exploration = exploration;
      this.polypsService.createPolyp(this.newPolyp).subscribe(polyp => {
        this.polyps.push(polyp);
        this.newPolyp = new Polyp();
        this.notificationService.success('Polyp registed successfully.', 'Polyp registered.');
        this.selectedPolyp = polyp;
      });
    });
    this.modalOpened = false;
  }

  nameIsUsed(): Boolean {
    if (this.polyps !== undefined) {
      return this.polyps.find((polyp) => polyp.name === this.newPolyp.name) !== undefined;
    } else {
      return false;
    }
  }

  addPolypRecording() {
    this.polypRecording = {
      id: null,
      video: this.video,
      polyp: this.selectedPolyp,
      start: this.timeToNumber.transform(this.start),
      end: this.timeToNumber.transform(this.end)
    };
    this.polypRecordingsService.createPolypRecording(this.polypRecording)
      .subscribe(
        polypRecording => {
          this.video.polypRecording = this.video.polypRecording.concat(polypRecording);
          this.start = null;
          this.end = null;
          this.selectedPolyp = null;
          this.notificationService.success('Polyp recording registered successfully.', 'Polyp recording registered');
        }
      );
  }

  removePolypRecording(polypRecording: PolypRecording) {
    this.polypRecordingsService.removePolypRecording(polypRecording).subscribe(() => {
        const index = this.video.polypRecording.indexOf(
          this.video.polypRecording.find(
            (polypRecordingFind) => polypRecordingFind === polypRecording));
        this.video.polypRecording.splice(index, 1);
        this.notificationService.success('Polyp recording removed successfully.', 'Polyp recording removed.');
      }
    );
    this.cancel();
  }

  remove(polypRecording: PolypRecording) {
    this.deletingPolypRecording = true;
    this.polypRecording = this.video.polypRecording.find(
      (polypRecordingFind) => polypRecordingFind === polypRecording);
  }

  cancel() {
    this.deletingPolypRecording = false;
  }
}
