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

import {AfterViewChecked, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {VideoSnapshot} from './VideoSnapshot';
import {areOverlappingIntervals, Interval} from '../../models/Interval';
import {VideoIntervalHighlight} from './VideoIntervalHighlight';
import {VIDEO_STEP_TYPE_ABBREVIATIONS, VideoStepType} from './VideoStepType';
import {Video} from '../../models/Video';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements AfterViewChecked, OnInit {
  @Input() video: Video;
  @Input() interval: Interval = null;
  @Input() limitToInterval = false;
  private _highlightZones: VideoIntervalHighlight[] = [];

  // tslint:disable-next-line:no-output-rename
  @Output('time') timeEmitter = new EventEmitter<number>();
  // tslint:disable-next-line:no-output-rename
  @Output('snapshot') snapshotEmitter = new EventEmitter<VideoSnapshot>();

  @ViewChild('container') containerElementRef: ElementRef;
  @ViewChild('videoElement') videoElementRef: ElementRef<HTMLVideoElement>;
  @ViewChild('progressElement') progressElementRef: ElementRef<HTMLInputElement>;

  fullscreen = false;
  videoSpeed = 3;
  videoStep = VideoStepType.SECONDS;

  readonly videoStepTypes = Array.from(VIDEO_STEP_TYPE_ABBREVIATIONS);

  private playWatcher: number = undefined;
  private intervalWatcher: number = undefined;
  private updateProgressWithTime = true;
  private progressbarBackground = '';
  private _displayTime: number = undefined;
  private secondsPerFrame: number;

  constructor(
    private cdRef: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    if (this.video === null || this.video === undefined) {
      throw new Error('video is required');
    }

    if (this.limitToInterval && (this.interval === null || this.interval.start > this.interval.end)) {
      throw new Error('limitToInterval can only be used with a valid interval');
    }

    this.secondsPerFrame = 1 / this.video.fps;

    this.videoElement.addEventListener('timeupdate', () => this.timeEmitter.emit(this.currentTime));
    this.videoElement.addEventListener('loadedmetadata', () => {
      this.progressElement.max = String(this.duration);
      this.progressElement.valueAsNumber = 0;
      this.currentTime = this.startTime;
    });

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
      : this.progressElement.valueAsNumber;

    this.cdRef.detectChanges();
  }

  @Input() set highlightZones(highlightZones: VideoIntervalHighlight[]) {
    this._highlightZones = highlightZones;

    let visibleZones;
    if (this.limitToInterval) {
      visibleZones = this._highlightZones
        .filter(zone => areOverlappingIntervals(zone.interval, this.interval));
    } else {
      visibleZones = this._highlightZones;
    }

    this.progressbarBackground = '';
    for (const zone of visibleZones) {
      const start = ((zone.interval.start - this.startTime) * 100 / this.duration).toFixed(4);
      const end = ((zone.interval.end - this.startTime) * 100 / this.duration).toFixed(4);

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
    this.videoElement.currentTime = Math.min(this.endTime, Math.max(this.startTime, time));
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

  private get endTime(): number {
    return this.limitToInterval ? this.interval.end : this.videoElement.duration;
  }

  private get startTime(): number {
    return this.limitToInterval ? this.interval.start : 0;
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

  stopVideo() {
    this.videoElement.pause();
    this.currentTime = this.startTime;
    this.progressElement.valueAsNumber = 0;
    clearInterval(this.playWatcher);
    this.playWatcher = undefined;
  }

  forwardVideo() {
    this.initializePlayWatcher();

    switch (this.videoStep) {
      case VideoStepType.FRAMES:
        this.currentTime = this.currentTime + this.secondsPerFrame;

        break;
      case VideoStepType.SECONDS:
        if (this.currentTime % 1 >= 0.99 || Number(this.videoSpeed) > 1) {
          this.currentTime = Math.floor(this.currentTime) + 0.999 + Number(this.videoSpeed);
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


    switch (this.videoStep) {
      case VideoStepType.FRAMES:
        this.currentTime = this.currentTime - this.secondsPerFrame;
        break;
      case VideoStepType.SECONDS:
        if (this.currentTime % 1 < 0.01 || Number(this.videoSpeed) > 1 || (!this.paused && Number(this.videoSpeed) === 1)) {
          this.currentTime = Math.floor(this.currentTime) - Number(this.videoSpeed);
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
    if (this.playWatcher !== undefined && this.playWatcher != null) {
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

        this.progressElement.value = String(this.currentTime - this.startTime);
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
    return interval.start <= interval.end
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
      this.progressElement.valueAsNumber = this.videoElement.currentTime;
      this.intervalWatcher = setInterval(() => {
        if (this.currentTime >= interval.end) {
          this.videoElement.pause();
          this.currentTime = interval.end;
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
    if (!this.limitToInterval && this.interval !== null && this.progressElement.valueAsNumber >= this.interval.end) {
      this.clearInterval();
    }
    this.currentTime = this.startTime + this.progressElement.valueAsNumber;
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
