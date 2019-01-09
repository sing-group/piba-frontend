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
  @Input() moveProgress: boolean;
  @Input() timesAreCorrect: Function;
  @Input() playInterval: Function;
  @Input() startInterval: Function;
  @Input() endInterval: Function;
  @Input() transformToTimePipe: Function;

  start: string;
  end: string;

  modifiers: Modifier[];
  selectedModifier: Modifier;

  deletingVideoModification = false;

  videoModification: VideoModification;
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

  addVideoModification() {
    this.videoModification = {
      id: null,
      video: this.video,
      modifier: this.selectedModifier,
      start: this.timeToNumber.transform(this.start),
      end: this.timeToNumber.transform(this.end)
    };
    this.videoModificationsService.createVideoModification(this.videoModification).subscribe(videoModification => {
        this.videoModifications = this.videoModifications.concat(videoModification);
        this.notificationService.success('Video modifier registered successfully.', 'Video modifier registered.');
        this.start = null;
        this.end = null;
        this.selectedModifier = null;
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
    this.cancel();
  }

  remove(videoModification: VideoModification) {
    this.deletingVideoModification = true;
    this.videoModification = this.videoModifications.find((toFind) => toFind === videoModification
    );
  }

  cancel() {
    this.deletingVideoModification = false;
  }

}
