/*
 *  PIBA Frontend
 *
 * Copyright (C) 2018-2020 - Miguel Reboiro-Jato,
 * Daniel Glez-Peña, Alba Nogueira Rodríguez, Florentino Fdez-Riverola,
 * Rubén Domínguez Carbajales, Jesús Miguel Herrero Rivas,
 * Eloy Sánchez Hernández, Laura Rivas Moral,
 * Manuel Puga Jiménez de Azcárate, Joaquín Cubiella Fernández,
 * Hugo López-Fernández, Silvia Rodríguez Iglesias, Fernando Campos Tato.
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {VideoSnapshot} from './VideoSnapshot';
import {areOverlappingIntervals, Interval, IntervalBoundaries, isValidInterval} from '../../models/Interval';
import {VideoIntervalHighlight} from './VideoIntervalHighlight';
import {speedIncrement, VideoSpeed} from './VideoSpeed';
import {Video} from '../../models/Video';
import {EnumUtils} from '../../utils/enum.utils';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoComponent implements AfterViewChecked, OnInit {
  private static readonly PROGRESS_PRECISION = 1000;

  @Input() video: Video;
  @Input() interval: Interval = null;
  @Input() limitToInterval = false;
  @Input() intervalBoundaries = IntervalBoundaries.BOTH_INCLUDED;
  @Input() snapshotEnabled = true;
  private _highlightZones: VideoIntervalHighlight[] = [];
  private _videoSpeed = VideoSpeed.SECONDS_3;
  @Output() videoSpeedChange = new EventEmitter<VideoSpeed>();

  // tslint:disable-next-line:no-output-rename
  @Output('time') timeEmitter = new EventEmitter<number>();
  // tslint:disable-next-line:no-output-rename
  @Output('snapshot') snapshotEmitter = new EventEmitter<VideoSnapshot>();
  // tslint:disable-next-line:no-output-rename
  @Output('ready') readyEmitter = new EventEmitter<boolean>();

  @ViewChild('container') containerElementRef: ElementRef;
  @ViewChild('videoElement') videoElementRef: ElementRef<HTMLVideoElement>;
  @ViewChild('progressElement') progressElementRef: ElementRef<HTMLInputElement>;

  fullscreen = false;

  readonly videoSpeedValues = EnumUtils.enumValues(VideoSpeed);

  private playWatcher: number = undefined;
  private intervalWatcher: number = undefined;
  private updateProgressWithTime = true;
  private progressbarBackground = '';
  private _displayTime: number = undefined;
  private secondsPerFrame: number;

  constructor(
    private changeDetectorRef: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    if (!Boolean(this.video)) {
      throw new Error('video is required');
    }

    if (this.limitToInterval && (this.interval === null || !isValidInterval(this.interval, this.intervalBoundaries))) {
      throw new Error('limitToInterval can only be used with a valid interval');
    }

    this.secondsPerFrame = 1 / this.video.fps;

    this.videoElement.addEventListener('timeupdate', () => this.timeEmitter.emit(this.currentTime));
    this.videoElement.addEventListener('loadedmetadata', () => {
      this.progressElement.max = String(this.duration * VideoComponent.PROGRESS_PRECISION);
      this.currentProgressTime = 0;
      this.currentTime = this.startTime;
    });
    this.videoElement.addEventListener('canplaythrough', () => this.readyEmitter.emit(true));

    const updateFullscreen = this.updateFullscreen.bind(this);
    document.addEventListener('fullscreenchange', updateFullscreen);
    document.addEventListener('mozfullscreenchange', updateFullscreen);
    document.addEventListener('webkitfullscreenchange', updateFullscreen);
  }

  ngAfterViewChecked() {
    this.progressElement.style.background = this.progressbarBackground;
    this.progressElement.style.height = '100%';
    this._displayTime = this.updateProgressWithTime
      ? this.currentTime - this.startTime
      : this.currentProgressTime;

    this.changeDetectorRef.detectChanges();
  }

  @Input() set videoSpeed(speed: VideoSpeed) {
    if (this._videoSpeed !== speed) {
      this._videoSpeed = speed;
      this.videoSpeedChange.emit(this._videoSpeed);
    }
  }

  get videoSpeed(): VideoSpeed {
    return this._videoSpeed;
  }

  @Input() set highlightZones(highlightZones: VideoIntervalHighlight[]) {
    this._highlightZones = highlightZones;

    let visibleZones;
    if (this.limitToInterval) {
      visibleZones = this._highlightZones
        .filter(zone => areOverlappingIntervals(zone.interval, this.interval, this.intervalBoundaries));
    } else {
      visibleZones = this._highlightZones;
    }

    this.progressbarBackground = '';
    for (const zone of visibleZones) {
      let zoneStart;
      let zoneEnd;

      switch (this.intervalBoundaries) {
        case IntervalBoundaries.BOTH_INCLUDED:
          zoneStart = zone.interval.start;
          zoneEnd = zone.interval.end + 0.999;
          break;
        case IntervalBoundaries.BOTH_EXCLUDED:
          zoneStart = zone.interval.start + 1;
          zoneEnd = zone.interval.end;
          break;
        case IntervalBoundaries.START_INCLUDED_END_EXCLUDED:
          zoneStart = zone.interval.start;
          zoneEnd = zone.interval.end;
          break;
        case IntervalBoundaries.START_EXCLUDED_END_INCLUDED:
          zoneStart = zone.interval.start + 1;
          zoneEnd = zone.interval.end + 0.999;
          break;
      }

      const start = ((zoneStart - this.startTime) * 100 / this.duration).toFixed(4);
      const end = ((zoneEnd - this.startTime) * 100 / this.duration).toFixed(4);

      if (this.progressbarBackground !== '') {
        this.progressbarBackground += ', ';
      }

      this.progressbarBackground += `linear-gradient(to right, transparent
        ,transparent ${start}%, ${zone.color} ${start}%,
          ${zone.color} ${end}%, transparent ${end}%
      )`;
    }
  }

  private get progressElement(): HTMLInputElement {
    return this.progressElementRef.nativeElement;
  }

  private get videoElement(): HTMLVideoElement {
    return this.videoElementRef.nativeElement;
  }

  public stopAtSecondStart(): number {
    this.videoElement.pause();
    this.currentTime = Math.floor(this.videoElement.currentTime);

    return this.currentTime;
  }

  public stopAtSecondEnd(): number {
    this.videoElement.pause();
    this.currentTime = Math.floor(this.videoElement.currentTime) + 0.999;

    return this.currentTime;
  }

  get paused(): boolean {
    return this.videoElement.paused;
  }

  get currentTime(): number {
    return this.videoElement.currentTime;
  }

  set currentTime(time: number) {
    time = Math.min(this.endTime, Math.max(this.startTime, time));
    this.videoElement.currentTime = Number.isNaN(time) ? 0 : time;
  }

  private set currentProgressTime(progress: number) {
    this.progressElement.valueAsNumber = progress * VideoComponent.PROGRESS_PRECISION;
  }

  private get currentProgressTime(): number {
    return this.progressElement.valueAsNumber / VideoComponent.PROGRESS_PRECISION;
  }

  get offsetWidth(): number {
    return this.videoElement.offsetWidth;
  }

  get duration(): number {
    return this.endTime - this.startTime;
  }

  get displayTime(): number {
    return this._displayTime;
  }

  private get startTime(): number {
    if (this.limitToInterval) {
      switch (this.intervalBoundaries) {
        case IntervalBoundaries.BOTH_INCLUDED:
        case IntervalBoundaries.START_INCLUDED_END_EXCLUDED:
          return this.interval.start;
        case IntervalBoundaries.BOTH_EXCLUDED:
        case IntervalBoundaries.START_EXCLUDED_END_INCLUDED:
          return this.interval.start + 1;
        default:
          throw new Error('Invalid interval boundaries: ' + this.intervalBoundaries);
      }
    } else {
      return 0;
    }
  }

  private get endTime(): number {
    if (this.limitToInterval) {
      return this.currentIntervalEnd;
    } else {
      return this.videoElement.duration;
    }
  }

  private get currentIntervalEnd(): number {
    if (this.interval === null) {
      throw new Error('No interval is set');
    } else {
      switch (this.intervalBoundaries) {
        case IntervalBoundaries.BOTH_INCLUDED:
        case IntervalBoundaries.START_EXCLUDED_END_INCLUDED:
          return this.interval.end + 0.999;
        case IntervalBoundaries.BOTH_EXCLUDED:
        case IntervalBoundaries.START_INCLUDED_END_EXCLUDED:
          return this.interval.end;
        default:
          throw new Error('Invalid interval boundaries: ' + this.intervalBoundaries);
      }
    }
  }

  playVideo() {
    if (this.paused) {
      if (this.currentTime === this.endTime) {
        this.currentTime = this.startTime;
      }
      this.videoElement.play();
    } else {
      this.videoElement.pause();
    }
    this.initializePlayWatcher();
  }

  stopVideo(time = this.startTime) {
    if (time < this.startTime || time > this.endTime) {
      throw new Error('Invalid time: ' + time);
    }

    this.videoElement.pause();
    this.currentTime = time;
    this.currentProgressTime = time - this.startTime;
    clearInterval(this.playWatcher);
    this.playWatcher = undefined;
  }

  forwardVideo() {
    this.initializePlayWatcher();

    switch (this.videoSpeed) {
      case VideoSpeed.FRAMES_1:
      case VideoSpeed.FRAMES_3:
      case VideoSpeed.FRAMES_5:
        const framesIncrement = speedIncrement(this.videoSpeed);
        this.currentTime = this.currentTime + this.secondsPerFrame * framesIncrement;

        break;
      case VideoSpeed.SECONDS_1:
      case VideoSpeed.SECONDS_3:
      case VideoSpeed.SECONDS_5:
        const secondsIncrement = speedIncrement(this.videoSpeed);

        if (this.currentTime % 1 >= 0.99 || secondsIncrement > 1) {
          this.currentTime = Math.floor(this.currentTime) + 0.999 + secondsIncrement;
        } else {
          this.currentTime = Math.floor(this.currentTime) + 0.999;
        }
        break;
    }

    if (this.currentTime === this.endTime) {
      this.videoElement.pause();
    }
  }

  backwardVideo() {
    this.initializePlayWatcher();

    switch (this.videoSpeed) {
      case VideoSpeed.FRAMES_1:
      case VideoSpeed.FRAMES_3:
      case VideoSpeed.FRAMES_5:
        const framesDecrement = speedIncrement(this.videoSpeed);

        this.currentTime = this.currentTime - this.secondsPerFrame * framesDecrement;
        break;
      case VideoSpeed.SECONDS_1:
      case VideoSpeed.SECONDS_3:
      case VideoSpeed.SECONDS_5:
        const secondsDecrement = speedIncrement(this.videoSpeed);

        if (this.currentTime % 1 < 0.01 || secondsDecrement > 1 || (!this.paused && secondsDecrement === 1)) {
          this.currentTime = Math.floor(this.currentTime) - secondsDecrement;
        } else {
          this.currentTime = Math.floor(this.currentTime);
        }
        break;
    }

    if (this.currentTime === this.startTime) {
      this.videoElement.pause();
    }
  }

  initializePlayWatcher() {
    if (Boolean(this.playWatcher)) {
      clearInterval(this.playWatcher);
    }

    this.playWatcher = setInterval(() => {
      if (this.updateProgressWithTime) {
        if (this.limitToInterval && this.currentTime >= this.endTime) {
          this.currentTime = this.endTime;
          this.videoElement.pause();
          clearInterval(this.playWatcher);
          this.playWatcher = undefined;
        }

        this.currentProgressTime = this.currentTime - this.startTime;
      }
    }, 100);
  }

  fullscreenVideo() {
    const document: any = window.document;

    if (this.fullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } else {
      const container = this.containerElementRef.nativeElement;

      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
    }
  }

  isValidInterval(interval: Interval): boolean {
    return isValidInterval(interval, this.intervalBoundaries)
      && this.duration !== undefined
      && interval.start >= 0
      && interval.end <= this.duration;
  }

  playInterval(interval: Interval): void {
    if (this.limitToInterval) {
      throw new Error('interval can\'t be changed when using limitToInterval');
    }

    if (this.isValidInterval(interval)) {
      this.videoElement.pause();

      this.clearInterval();

      this.interval = interval;
      this.currentTime = interval.start;
      this.currentProgressTime = this.videoElement.currentTime;
      this.intervalWatcher = setInterval(() => {
        if (this.currentTime >= this.currentIntervalEnd) {
          this.videoElement.pause();
          this.currentTime = this.currentIntervalEnd;
          this.clearInterval();
        }
      }, 100);

      this.videoElement.play();
    }
  }

  private clearInterval() {
    if (this.interval !== null) {
      this.interval = null;

      if (this.intervalWatcher !== undefined) {
        clearInterval(this.intervalWatcher);
        this.intervalWatcher = undefined;
      }
    }
  }

  private updateFullscreen() {
    const document: any = window.document;

    this.fullscreen = document.fullscreenElement
      || document.webkitFullscreenElement
      || document.mozFullScreenElement
      || document.msFullscreenElement;
  }

  mouseDownProgress() {
    this.updateProgressWithTime = false;
  }

  mouseUpProgress() {
    if (!this.limitToInterval && this.interval !== null && this.currentProgressTime >= this.currentIntervalEnd) {
      this.clearInterval();
    }
    this.currentTime = this.startTime + this.currentProgressTime;
    this.updateProgressWithTime = true;
  }

  getSnapshot() {
    this.videoElement.pause();

    this.snapshotEmitter.emit({
      time: this.currentTime,
      width: this.videoElement.videoWidth,
      height: this.videoElement.videoHeight,
      video: this.videoElement
    });
  }
}
