import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit {
  // tslint:disable-next-line:no-output-rename
  @Output('currentTime') timeEmitter = new EventEmitter<number>();

  @ViewChild('container') containerElement: ElementRef;
  @ViewChild('video') videoElement: ElementRef;

  fullscreen = false;
  playWatcher: any;

  progress: HTMLInputElement;
  moveProgress = false;
  // tslint:disable-next-line:no-output-rename
  @Output('mouseInProgress') mouseInProgress = new EventEmitter<boolean>();

  videoSpeed = 3;

  constructor() {
  }

  ngOnInit() {
    this.video.addEventListener('timeupdate', () => this.timeEmitter.emit(this.video.currentTime));

    const updateFullscreen = this.updateFullscreen.bind(this);
    document.addEventListener('fullscreenchange', updateFullscreen);
    document.addEventListener('mozfullscreenchange', updateFullscreen);
    document.addEventListener('webkitfullscreenchange', updateFullscreen);

    this.progress = document.getElementById('progress') as HTMLInputElement;
    this.progress.valueAsNumber = 0;

    this.videoElement.nativeElement.addEventListener('loadedmetadata', () => this.progress.max = this.video.duration);
  }

  private get video() {
    return this.videoElement.nativeElement;
  }

  get paused() {
    return this.video.paused;
  }

  get currentTime() {
    return this.video.currentTime;
  }

  playVideo() {
    if (this.paused) {
      this.video.play();
    } else {
      this.video.pause();
    }
    if (this.playWatcher !== undefined && this.playWatcher != null) {
      clearInterval(this.playWatcher);
    }
    this.playWatcher = setInterval(() => {
      if (!this.moveProgress) {
        this.progress.value = this.video.currentTime;
      }
    }, 100);
  }

  stopVideo() {
    this.video.pause();
    this.video.currentTime = 0;
    clearInterval(this.playWatcher);
  }

  forwardVideo() {
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
    if (this.video.currentTime % 1 < 0.01 || Number(this.videoSpeed) > 1) {
      this.video.currentTime = Math.max(0, Math.floor(this.video.currentTime) - Number(this.videoSpeed));
    } else {
      this.video.currentTime = Math.max(0, Math.floor(this.video.currentTime));
    }
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

  private updateFullscreen() {
    const document: any = window.document;

    this.fullscreen = document.fullscreenElement
      || document.webkitFullscreenElement
      || document.mozFullScreenElement
      || document.msFullscreenElement;
  }

  mouseDownProgress() {
    this.moveProgress = true;
    this.mouseInProgress.emit(this.moveProgress);
  }

  mouseUpProgress() {
    this.moveProgress = false;
    this.video.currentTime = this.progress.valueAsNumber;
    this.mouseInProgress.emit(this.moveProgress);
  }
}
