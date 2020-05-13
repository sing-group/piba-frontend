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

import {AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {VideoSnapshot} from './VideoSnapshot';
import {Interval} from '../../models/Interval';
import {VideoIntervalHighlight} from './VideoIntervalHighlight';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements AfterViewChecked, OnInit {
  @Input() interval: Interval = null;
  @Input() highlightZones: VideoIntervalHighlight[] = [];

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

  constructor() {
  }

  ngOnInit() {
    this.video.addEventListener('timeupdate', () => this.timeEmitter.emit(this.video.currentTime));
    this.video.addEventListener('loadedmetadata', () => this.progress.max = String(this.video.duration));

    const updateFullscreen = this.updateFullscreen.bind(this);
    document.addEventListener('fullscreenchange', updateFullscreen);
    document.addEventListener('mozfullscreenchange', updateFullscreen);
    document.addEventListener('webkitfullscreenchange', updateFullscreen);

    this.progress.valueAsNumber = 0;
  }

  ngAfterViewChecked() {
    let background = '';

    for (const zone of this.highlightZones) {
      const start = (zone.interval.start * 100 / this.duration).toFixed(4);
      const end = (zone.interval.end * 100 / this.duration).toFixed(4);

      if (background !== '') {
        background += ', ';
      }

      background += `linear-gradient(to right, transparent
        ,transparent ${start}%, ${zone.color} ${start}%,
          ${zone.color} ${end}%, transparent ${end}%
      )`;
    }

    this.progressbarElement.nativeElement.style.background = background;
    this.progressbarElement.nativeElement.style.height = '100%';
  }

  private get progress(): HTMLInputElement {
    return this.progressbarElement.nativeElement;
  }

  private get video(): HTMLVideoElement {
    return this.videoElement.nativeElement;
  }

  public stopAtSecondStart(): number {
    this.video.pause();
    this.video.currentTime = Math.floor(this.video.currentTime);

    return this.video.currentTime;
  }

  public stopAtSecondEnd(): number {
    this.video.pause();
    this.video.currentTime = Math.floor(this.video.currentTime) + 0.999;

    return this.video.currentTime;
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
    return this.video.duration;
  }

  get displayTime(): number {
    if (this.updateProgressWithTime) {
      return this.currentTime;
    } else {
      return this.progress.valueAsNumber;
    }
  }

  playVideo() {
    if (this.paused) {
      this.video.play();
    } else {
      this.video.pause();
    }
    this.initializePlayWatcher();
  }

  stopVideo() {
    this.video.pause();
    this.video.currentTime = 0;
    this.progress.valueAsNumber = 0;
    clearInterval(this.playWatcher);
  }

  forwardVideo() {
    this.initializePlayWatcher();
    if (this.video.currentTime % 1 >= 0.99 || Number(this.videoSpeed) > 1) {
      this.video.currentTime = Math.min(this.video.duration, Math.floor(this.video.currentTime) + 0.999 + Number(this.videoSpeed));
    } else {
      this.video.currentTime = Math.min(this.video.duration, Math.floor(this.video.currentTime) + 0.999);
    }

    if (this.video.currentTime === this.video.duration) {
      this.video.pause();
    }
  }

  backwardVideo() {
    this.initializePlayWatcher();
    if (this.video.currentTime % 1 < 0.01 || Number(this.videoSpeed) > 1 || (!this.paused && Number(this.videoSpeed) === 1)) {
      this.video.currentTime = Math.max(0, Math.floor(this.video.currentTime) - Number(this.videoSpeed));
    } else {
      this.video.currentTime = Math.max(0, Math.floor(this.video.currentTime));
    }
  }

  initializePlayWatcher() {
    if (this.playWatcher !== undefined && this.playWatcher != null) {
      clearInterval(this.playWatcher);
    }
    this.playWatcher = setInterval(() => {
      if (this.updateProgressWithTime) {
        this.progress.value = String(this.video.currentTime);
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
    if (this.isValidInterval(interval)) {
      this.video.pause();

      this.clearInterval();

      this.interval = interval;
      this.video.currentTime = interval.start;
      this.progress.valueAsNumber = this.video.currentTime;
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
    if (this.interval !== null && this.progress.valueAsNumber >= this.interval.end) {
      this.clearInterval();
    }
    this.video.currentTime = this.progress.valueAsNumber;
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
