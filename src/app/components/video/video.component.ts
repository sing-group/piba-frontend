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
  AfterViewInit,
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
import {areOverlappingIntervals, Interval} from '../../models/Interval';
import {VideoIntervalHighlight} from './VideoIntervalHighlight';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements AfterViewChecked, OnInit {
  @Input() interval: Interval = null;
  @Input() limitToInterval = false;
  private _highlightZones: VideoIntervalHighlight[] = [];

  // tslint:disable-next-line:no-output-rename
  @Output('time') timeEmitter = new EventEmitter<number>();
  // tslint:disable-next-line:no-output-rename
  @Output('snapshot') snapshotEmitter = new EventEmitter<VideoSnapshot>();

  @ViewChild('container') containerElement: ElementRef;
  @ViewChild('video') videoElement: ElementRef<HTMLVideoElement>;
  @ViewChild('progressbar') progressbarElement: ElementRef<HTMLInputElement>;

  fullscreen = false;
  videoSpeed = 3;

  private playWatcher: number = undefined;
  private intervalWatcher: number = undefined;
  private updateProgressWithTime = true;
  private progressbarBackground = '';
  private _displayTime: number = undefined;

  constructor(
    private cdRef: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    if (this.limitToInterval && (this.interval === null || this.interval.start > this.interval.end)) {
      throw new Error('limitToInterval can only be used with a valid interval');
    }

    this.video.addEventListener('timeupdate', () => this.timeEmitter.emit(this.currentTime));
    this.video.addEventListener('loadedmetadata', () => {
      this.progressbar.max = String(this.duration);
      this.progressbar.valueAsNumber = 0;
      this.video.currentTime = this.startTime;
    });

    const updateFullscreen = this.updateFullscreen.bind(this);
    document.addEventListener('fullscreenchange', updateFullscreen);
    document.addEventListener('mozfullscreenchange', updateFullscreen);
    document.addEventListener('webkitfullscreenchange', updateFullscreen);

  }

  ngAfterViewChecked() {
    this.progressbar.style.background = this.progressbarBackground;
    this.progressbar.style.height = '100%';
    this._displayTime = this.updateProgressWithTime
      ? this.currentTime - this.startTime
      : this.progressbar.valueAsNumber;

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

  private get progressbar(): HTMLInputElement {
    return this.progressbarElement.nativeElement;
  }

  private get video(): HTMLVideoElement {
    return this.videoElement.nativeElement;
  }

  public stopAtSecondStart(): number {
    this.video.pause();
    this.video.currentTime = Math.floor(this.video.currentTime);

    return this.currentTime;
  }

  public stopAtSecondEnd(): number {
    this.video.pause();
    this.video.currentTime = Math.floor(this.video.currentTime) + 0.999;

    if (this.video.currentTime > this.endTime) {
      this.video.currentTime = this.endTime;
    }

    return this.currentTime;
  }

  get paused(): boolean {
    return this.video.paused;
  }

  get currentTime(): number {
    return this.video.currentTime;
  }

  get offsetWidth(): number {
    return this.video.offsetWidth;
  }

  get duration(): number {
    return this.endTime - this.startTime;
  }

  get displayTime(): number {
    return this._displayTime;
  }

  private get endTime(): number {
    return this.limitToInterval ? this.interval.end : this.video.duration;
  }

  private get startTime(): number {
    return this.limitToInterval ? this.interval.start : 0;
  }

  playVideo() {
    if (this.paused) {
      if (this.currentTime === this.endTime) {
        this.video.currentTime = this.startTime;
      }
      this.video.play();
    } else {
      this.video.pause();
    }
    this.initializePlayWatcher();
  }

  stopVideo() {
    this.video.pause();
    this.video.currentTime = this.startTime;
    this.progressbar.valueAsNumber = 0;
    clearInterval(this.playWatcher);
    this.playWatcher = undefined;
  }

  forwardVideo() {
    this.initializePlayWatcher();
    if (this.currentTime % 1 >= 0.99 || Number(this.videoSpeed) > 1) {
      this.video.currentTime = Math.min(this.endTime, Math.floor(this.currentTime) + 0.999 + Number(this.videoSpeed));
    } else {
      this.video.currentTime = Math.min(this.endTime, Math.floor(this.currentTime) + 0.999);
    }

    if (this.currentTime === this.endTime) {
      this.video.pause();
    }
  }

  backwardVideo() {
    this.initializePlayWatcher();
    if (this.currentTime % 1 < 0.01 || Number(this.videoSpeed) > 1 || (!this.paused && Number(this.videoSpeed) === 1)) {
      this.video.currentTime = Math.max(this.startTime, Math.floor(this.currentTime) - Number(this.videoSpeed));
    } else {
      this.video.currentTime = Math.max(this.startTime, Math.floor(this.currentTime));
    }

    if (this.video.currentTime === this.startTime) {
      this.video.pause();
    }
  }

  initializePlayWatcher() {
    if (this.playWatcher !== undefined && this.playWatcher != null) {
      clearInterval(this.playWatcher);
    }

    this.playWatcher = setInterval(() => {
      if (this.updateProgressWithTime) {
        if (this.limitToInterval && this.currentTime >= this.endTime) {
          this.video.currentTime = this.endTime;
          this.video.pause();
          clearInterval(this.playWatcher);
          this.playWatcher = undefined;
        }

        this.progressbar.value = String(this.currentTime - this.startTime);
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
      const container = this.containerElement.nativeElement;

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
      this.video.pause();

      this.clearInterval();

      this.interval = interval;
      this.video.currentTime = interval.start;
      this.progressbar.valueAsNumber = this.video.currentTime;
      this.intervalWatcher = setInterval(() => {
        if (this.currentTime >= interval.end) {
          this.video.pause();
          this.video.currentTime = interval.end;
          this.clearInterval();
        }
      }, 100);

      this.video.play();
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
    if (!this.limitToInterval && this.interval !== null && this.progressbar.valueAsNumber >= this.interval.end) {
      this.clearInterval();
    }
    this.video.currentTime = this.startTime + this.progressbar.valueAsNumber;
    this.updateProgressWithTime = true;
  }

  getSnapshot() {
    this.video.pause();

    this.snapshotEmitter.emit({
      time: this.currentTime,
      width: this.video.videoWidth,
      height: this.video.videoHeight,
      video: this.video
    });
  }
}
