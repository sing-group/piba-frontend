import {Component, Input, OnInit} from '@angular/core';
import Video from '../../models/Video';
import {Modifier} from '../../models/Modifier';
import {VideoModification} from '../../models/VideoModification';
import {TimeToNumberPipe} from '../../pipes/time-to-number.pipe';
import {VideomodificationsService} from '../../services/videomodifications.service';
import {TimePipe} from '../../pipes/time.pipe';
import {ModifiersService} from '../../services/modifiers.service';

@Component({
  selector: 'app-video-modification',
  templateUrl: './video-modification.component.html',
  styleUrls: ['./video-modification.component.css']
})
export class VideoModificationComponent implements OnInit {

  @Input() video: Video;
  @Input() currentTime: number;
  @Input() timesAreCorrect: Function;

  start: String;
  end: String;

  modifiers: Modifier[];
  selectedModifier: Modifier;

  newVideoModification: VideoModification;
  videoModifications: VideoModification[] = [];

  constructor(
    private modifiersService: ModifiersService,
    private videoModificationsService: VideomodificationsService,
    private timePipe: TimePipe,
    private timeToNumber: TimeToNumberPipe) {
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
      video: this.video,
      modifier: this.selectedModifier,
      start: this.timeToNumber.transform(this.start),
      end: this.timeToNumber.transform(this.end)
    };
    this.videoModificationsService.createVideoModification(this.newVideoModification).subscribe(newVideoModification =>
      this.videoModifications = this.videoModifications.concat(newVideoModification)
    );
  }

  remove(videoModification: VideoModification) {
    this.videoModificationsService.removeVideoModification(videoModification).subscribe(
      () => {
        const index = this.videoModifications.indexOf(
          this.videoModifications.find((toFind) => toFind === videoModification
          )
        );
        this.videoModifications.splice(index, 1);
      }
    );
  }

}
