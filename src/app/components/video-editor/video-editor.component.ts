import {AfterViewChecked, Component, ElementRef, Input, OnInit, Pipe, PipeTransform, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Polyp} from '../../models/Polyp';
import {Video} from '../../models/Video';
import {VideosService} from '../../services/videos.service';
import {TimePipe} from '../../pipes/time.pipe';
import {PolypsService} from '../../services/polyps.service';
import {ExplorationsService} from '../../services/explorations.service';
import {PolypRecordingsService} from '../../services/polyprecordings.service';
import {TimeToNumberPipe} from '../../pipes/time-to-number.pipe';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {GalleriesService} from '../../services/galleries.service';
import {Gallery} from '../../models/Gallery';
import {Image} from '../../models/Image';
import {ImagesService} from '../../services/images.service';
import {ImageUploadInfo} from '../../services/entities/ImageUploadInfo';
import {AuthenticationService} from '../../services/authentication.service';
import {Role} from '../../models/User';
import {VideoModification} from '../../models/VideoModification';
import {VideoModificationsService} from '../../services/video-modifications.service';

@Pipe({
  name: 'dropdownFilter',
  pure: false
})
export class DropdownFilterPipe implements PipeTransform {
  transform(items: any[], filter: string): any {
    if (!items || !filter) {
      return items;
    } else if (items[0].title !== undefined) {
      return items.filter(item => item.title.toUpperCase().includes(filter.toUpperCase()));
    } else if (items[0].name !== undefined) {
      return items.filter(item => item.name.toUpperCase().includes(filter.toUpperCase()));
    }
  }
}

@Component({
  selector: 'app-video-editor',
  templateUrl: './video-editor.component.html',
  styleUrls: ['./video-editor.component.css']
})
export class VideoEditorComponent implements OnInit, AfterViewChecked {

  video: Video;

  start: string;
  end: string;

  modificationColor = 'rgba(241, 213, 117, 1)';
  polypColor = 'rgba(0, 198, 194, 0.5)';
  showPolyp = true;
  showModification = true;

  polyps: Polyp[] = [];
  selectedPolyp: Polyp = new Polyp();

  videoModifications: VideoModification[] = [];
  openSnapshotModal = false;
  galleries: Gallery[] = [];
  gallery: Gallery = new Gallery();
  galleryInput: string;
  polypInput: string;
  fileName: string;
  image: Image = new Image();
  role = Role;

  currentTime: number;
  snapshotTime: number;
  videoHTML: HTMLMediaElement;

  showPolypsInFrame = true;
  showPolypCheckbox = true;

  pauseWatcher: any;
  progress: HTMLInputElement;
  moveProgress = false;

  @ViewChild('canvas') canvas: ElementRef;

  constructor(
    private videosService: VideosService,
    private route: ActivatedRoute,
    private timePipe: TimePipe,
    private polypsService: PolypsService,
    private explorationsService: ExplorationsService,
    private polypRecordingsService: PolypRecordingsService,
    private videoModificationsService: VideoModificationsService,
    private timeToNumber: TimeToNumberPipe,
    private galleriesService: GalleriesService,
    private imagesService: ImagesService,
    private notificationService: NotificationService,
    public readonly authenticationService: AuthenticationService
  ) {
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    this.videosService.getVideo(id)
      .subscribe(video => {
        this.video = video;
        this.videoModificationsService.getVideoModifications(this.video.id)
          .subscribe(videoModifications => {
            this.videoModifications = videoModifications;
          });
      });

    this.galleriesService.getGalleries().subscribe(galleries => {
      this.galleries = galleries.sort((a, b) => a.title > b.title ? 1 : -1);
      this.galleries = galleries.sort((a, b) => a.title > b.title ? 1 : -1);
    });
  }

  ngAfterViewChecked() {
    const progressbar = document.getElementById('progress') as HTMLInputElement;
    this.videoHTML = document.getElementById('video-exploration') as HTMLMediaElement;
    const legendCheckboxContainer = document.getElementById('legend-checkbox-container') as HTMLElement;

    let background = '';

    if (this.video !== undefined && !isNaN(this.videoHTML.duration)) {
      // assign the width of the video to the legends and checkboxes container
      legendCheckboxContainer.style.width = this.videoHTML.offsetWidth + 'px';

      const duration = Math.trunc(this.videoHTML.duration);
      if (this.showPolyp) {
        background += 'linear-gradient(to right, transparent';
        this.video.polypRecording.sort((p1, p2) => p1.start - p2.start).forEach(polypRecording => {
          const start = (polypRecording.start * 100 / duration).toFixed(4);
          const end = (polypRecording.end * 100 / duration).toFixed(4);

          background += `,transparent ${start}%, ${this.polypColor} ${start}%, ${this.polypColor} ${end}%, transparent ${end}%`;
        });

        background += ')';
      }

      background += this.showPolyp && this.showModification && this.videoModifications.length > 0 ? ', ' : '';

      if (this.videoModifications.length > 0 && this.showModification) {
        background += 'linear-gradient(to right, transparent';
        this.videoModifications.sort((p1, p2) => p1.start - p2.start).forEach(modification => {
          const start = (modification.start * 100 / duration).toFixed(4);
          const end = (modification.end * 100 / duration).toFixed(4);
          background += `,transparent ${start}%,${this.modificationColor} ${start}%, ${this.modificationColor} ${end}%,transparent ${end}%`;
        });

        background += ')';
      }

      progressbar.style.background = background;
      progressbar.style.height = '100%';
    }
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

  onCurrentTimeUpdate(time: number) {
    this.currentTime = time;
  }

  mouseInProgress(move: boolean) {
    this.moveProgress = move;
  }

  videoModificationsUpdate(modifications: VideoModification[]) {
    this.videoModifications = modifications;
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

  getSnapshot() {
    this.snapshotTime = this.currentTime === undefined ? 0 : this.currentTime;
    const videoHTML = document.getElementById('video-exploration') as HTMLVideoElement;
    videoHTML.pause();
    this.canvas.nativeElement.width = videoHTML.videoWidth;
    this.canvas.nativeElement.height = videoHTML.videoHeight;
    this.canvas.nativeElement.getContext('2d').drawImage(videoHTML, 0, 0,
      videoHTML.videoWidth, videoHTML.videoHeight);
    this.showPolypCheckbox = this.getPolyps().length !== this.polyps.length;
    this.getFileName();
    this.openSnapshotModal = true;
  }

  getFileName() {
    this.fileName = this.video.id + '_' + Math.round(this.video.fps * this.snapshotTime) + '.png';
  }

  saveSnapshot() {
    this.currentTime = this.snapshotTime;
    this.image.video = this.video;
    this.image.gallery = this.gallery;
    this.image.polyp = this.selectedPolyp;
    this.image.numFrame = Math.round(this.image.video.fps * this.snapshotTime);
    this.image.base64contents = this.canvas.nativeElement.toDataURL();

    let imageUploadInfo;
    if (this.polypInput !== '' && this.polypInput !== undefined) {
      imageUploadInfo = this.mapImageWithPolyp(this.image);
    } else {
      imageUploadInfo = this.mapImage(this.image);
    }
    imageUploadInfo.image = this.base64toFile(this.image.base64contents);

    this.discardSnapshot();

    this.imagesService.uploadImage(imageUploadInfo).subscribe((image) => {
      this.notificationService.success('Image registered successfully.', 'Image registered.');
    });
  }

  base64toFile(dataURI): File {
    // convert the data URL to a byte string
    const binary = atob(dataURI.split(',')[1]);

    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }

    const blob = new Blob([new Uint8Array(array)], {'type': 'image/png'});
    blob['name'] = 'file';

    return <File>blob;
  }

  galleryNonExists(): boolean {
    return this.galleries.filter(gallery => gallery.title === this.galleryInput).length <= 0 ||
      this.gallery.title !== this.galleryInput;
  }

  polypIsCorrect() {
    return this.selectedPolyp.name === this.polypInput || this.polypInput === '';
  }

  selectGallery(gallery: Gallery) {
    this.galleryInput = gallery.title;
    this.gallery = gallery;
  }

  selectPolyp(polyp: Polyp) {
    this.polypInput = polyp.name;
    this.selectedPolyp = polyp;
  }

  getPolyps(): Polyp[] {
    const polypRecordings = this.video.polypRecording.filter(polypRecording => this.snapshotTime >= polypRecording.start &&
      this.snapshotTime <= polypRecording.end);
    const polypsInPolypRecording = Array.from(polypRecordings, p => p.polyp);
    return polypRecordings.length > 0 && this.showPolypsInFrame ? polypsInPolypRecording.sort(
      (a, b) => a.name > b.name ? 1 : -1) : this.polyps.sort((a, b) => a.name > b.name ? 1 : -1);
  }

  discardSnapshot() {
    this.openSnapshotModal = false;
    this.gallery = new Gallery();
    this.galleryInput = '';
    this.selectedPolyp = new Polyp();
    this.polypInput = '';
    this.showPolypsInFrame = true;
  }

  private mapImage(image: Image): ImageUploadInfo {
    return {
      image: null,
      gallery: image.gallery.id,
      video: image.video.id,
      polyp: null,
      numFrame: image.numFrame
    };
  }

  private mapImageWithPolyp(image: Image): ImageUploadInfo {
    return {
      image: null,
      gallery: image.gallery.id,
      video: image.video.id,
      polyp: image.polyp.id,
      numFrame: image.numFrame
    };
  }
}
