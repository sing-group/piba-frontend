import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Polyp} from '../../models/Polyp';
import {Video} from '../../models/Video';
import {VideosService} from '../../services/videos.service';
import {TimePipe} from '../../pipes/time.pipe';
import {PolypsService} from '../../services/polyps.service';
import {ExplorationsService} from '../../services/explorations.service';
import {PolypRecordingsService} from '../../services/polyprecordings.service';
import {PolypRecording} from '../../models/PolypRecording';
import {TimeToNumberPipe} from '../../pipes/time-to-number.pipe';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {ClrDatagridSortOrder} from '@clr/angular';

@Component({
  selector: 'app-video-editor',
  templateUrl: './video-editor.component.html',
  styleUrls: ['./video-editor.component.css']
})
export class VideoEditorComponent implements OnInit {

  video: Video;
  ascSort = ClrDatagridSortOrder.ASC;

  start: string;
  end: string;

  newPolyp: Polyp = new Polyp();
  polyps: Polyp[] = [];
  selectedPolyp: Polyp = new Polyp();

  polypRecording: PolypRecording;

  currentTime: number;
  videoHTML: HTMLMediaElement;

  deletingPolypRecording = false;
  modalOpened = false;

  pauseWatcher: any;
  progress: HTMLInputElement;
  moveProgress = false;

  constructor(
    private videosService: VideosService,
    private route: ActivatedRoute,
    private timePipe: TimePipe,
    private polypsService: PolypsService,
    private explorationsService: ExplorationsService,
    private polypRecordingsService: PolypRecordingsService,
    private timeToNumber: TimeToNumberPipe,
    private notificationService: NotificationService,
  ) {
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    this.videosService.getVideo(id)
      .subscribe(video => {
        this.video = video;
        this.explorationsService.getPolyps(this.video.exploration).subscribe(polyps => this.polyps = polyps);
        this.polypRecordingsService.getPolypRecordingsByVideo(video.id).subscribe(polypRecordings => {
            this.video.polypRecording = polypRecordings;
          }
        );
      });
  }

  startInterval() {
    this.videoHTML = document.getElementById('video-exploration') as HTMLMediaElement;
    this.videoHTML.pause();
    this.videoHTML.currentTime = Math.floor(this.videoHTML.currentTime);
    this.currentTime = this.videoHTML.currentTime;
    this.start = this.transformToTimePipe();
  }

  endInterval() {
    this.videoHTML = document.getElementById('video-exploration') as HTMLMediaElement;
    this.videoHTML.pause();
    this.videoHTML.currentTime = Math.floor(this.videoHTML.currentTime) + 0.999;
    this.currentTime = this.videoHTML.currentTime;
    this.end = this.transformToTimePipe();
  }

  transformToTimePipe(): string {
    if (this.currentTime === undefined) {
      return this.timePipe.transform(0);
    } else {
      return this.timePipe.transform(this.currentTime);
    }
  }

  cancel() {
    this.deletingPolypRecording = false;
  }

  onCurrentTimeUpdate(time: number) {
    this.currentTime = time;
  }

  mouseInProgress(move: boolean) {
    this.moveProgress = move;
  }

  public timesAreCorrect(): Boolean {
    if (this.start === undefined || this.start === null || this.end === undefined || this.end === null) {
      return false;
    }
    this.videoHTML = document.getElementById('video-exploration') as HTMLMediaElement;
    if (this.videoHTML.duration === undefined && this.timeToNumber.transform(this.start) > this.videoHTML.duration ||
      this.timeToNumber.transform(this.end) > this.videoHTML.duration) {
      return false;
    }
    return (this.timeToNumber.transform(this.start) < this.timeToNumber.transform(this.end));
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
    return this.polyps.find((polyp) => polyp.name === this.newPolyp.name) !== undefined;
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


  playInterval(start: number, end: number) {
    this.progress = document.getElementById('progress') as HTMLInputElement;
    this.videoHTML = document.getElementById('video-exploration') as HTMLMediaElement;
    this.videoHTML.currentTime = start;
    this.videoHTML.play();

    if (this.pauseWatcher !== undefined && this.pauseWatcher != null) {
      clearInterval(this.pauseWatcher);
    }
    this.pauseWatcher = setInterval(() => {
      if (!this.moveProgress) {
        this.progress.value = this.videoHTML.currentTime.toString();
      }
      if (this.videoHTML.currentTime >= end) {
        this.videoHTML.pause();
        clearInterval(this.pauseWatcher);
      }
    }, 100);
  }
}
