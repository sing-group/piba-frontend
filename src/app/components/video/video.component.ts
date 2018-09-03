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

  constructor() {
  }

  ngOnInit() {
    this.video.addEventListener('timeupdate', event => this.timeEmitter.emit(this.video.currentTime));

    const updateFullscreen = this.updateFullscreen.bind(this);
    document.addEventListener('fullscreenchange', updateFullscreen);
    document.addEventListener('mozfullscreenchange', updateFullscreen);
    document.addEventListener('webkitfullscreenchange', updateFullscreen);
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
  }

  stopVideo() {
    this.video.pause();
    this.video.currentTime = 0;
  }

  forwardVideo() {
    this.video.currentTime = Math.min(this.video.duration, this.video.currentTime + 3);

    if (this.video.currentTime === this.video.duration) {
      this.video.pause();
    }
  }

  backwardVideo() {
    this.video.currentTime = Math.max(0, this.video.currentTime - 3);
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
}
