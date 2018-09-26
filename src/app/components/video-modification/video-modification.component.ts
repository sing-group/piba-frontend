import {Component, Input, OnInit} from '@angular/core';
import {Video} from '../../models/Video';
import {Modifier} from '../../models/Modifier';
import {VideoModification} from '../../models/VideoModification';
import {TimeToNumberPipe} from '../../pipes/time-to-number.pipe';
import {VideoModificationsService} from '../../services/video-modifications.service';
import {TimePipe} from '../../pipes/time.pipe';
import {ModifiersService} from '../../services/modifiers.service';
import {NotificationService} from '../../modules/notification/services/notification.service';

@Component({
  selector: 'app-video-modification',
  templateUrl: './video-modification.component.html',
  styleUrls: ['./video-modification.component.css']
})
export class VideoModificationComponent implements OnInit {

  @Input() video: Video;
  @Input() currentTime: number;
  @Input() timesAreCorrect: Function;
  @Input() playInterval: Function;

  start: String;
  end: String;

  modifiers: Modifier[];
  selectedModifier: Modifier;

  newVideoModification: VideoModification;
  videoModifications: VideoModification[] = [];

  constructor(
    private modifiersService: ModifiersService,
    private videoModificationsService: VideoModificationsService,
    private timePipe: TimePipe,
    private timeToNumber: TimeToNumberPipe,
    private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.modifiersService.getModifiers().subscribe((modifiers) => this.modifiers = modifiers);
    this.videoModificationsService.getVideoModifications(this.video.id)
      .subscribe(videoModifications => this.videoModifications = videoModifications);
  }

  startModifier() {
    if (this.currentTime === undefined) {
      this.start = this.timePipe.transform(0);
    } else {
      this.start = this.timePipe.transform(this.currentTime);
    }
  }

  endModifier() {
    if (this.currentTime === undefined) {
      this.end = this.timePipe.transform(0);
    } else {
      this.end = this.timePipe.transform(this.currentTime);
    }
  }

  addVideoModification() {
    this.newVideoModification = {
      id: null,
      video: this.video,
      modifier: this.selectedModifier,
      start: this.timeToNumber.transform(this.start),
      end: this.timeToNumber.transform(this.end)
    };
    this.videoModificationsService.createVideoModification(this.newVideoModification).subscribe(newVideoModification => {
        this.videoModifications = this.videoModifications.concat(newVideoModification);
        this.notificationService.success('Video modifier registered successfully.', 'Video modifier registered.');
      }
    );
  }

  removeVideoModification(videoModification: VideoModification) {
    this.videoModificationsService.removeVideoModification(videoModification.id).subscribe(
      () => {
        const index = this.videoModifications.indexOf(
          this.videoModifications.find((toFind) => toFind === videoModification
          )
        );
        this.videoModifications.splice(index, 1);
        this.notificationService.success('Video modifier removed successfully.', 'Video modifier removed');
      }
    );
  }

}
