import {Component, ElementRef, OnInit, Pipe, PipeTransform, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Polyp} from '../../models/Polyp';
import {Video} from '../../models/Video';
import {VideosService} from '../../services/videos.service';
import {TimePipe} from '../../pipes/time.pipe';
import {PolypsService} from '../../services/polyps.service';
import {ExplorationsService} from '../../services/explorations.service';
import {PolypRecordingsService} from '../../services/polyprecordings.service';
import {PolypRecording} from '../../models/PolypRecording';
import {TimeToNumberPipe} from '../../pipes/time-to-number.pipe';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {ClrDatagridSortOrder} from '@clr/angular';
import {GalleriesService} from '../../services/galleries.service';
import {Gallery} from '../../models/Gallery';
import {Image} from '../../models/Image';
import {ImagesService} from '../../services/images.service';
import {ImageUploadInfo} from '../../services/entities/ImageUploadInfo';

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
export class VideoEditorComponent implements OnInit {

  video: Video;
  ascSort = ClrDatagridSortOrder.ASC;

  start: string;
  end: string;

  newPolyp: Polyp = new Polyp();
  polyps: Polyp[] = [];
  selectedPolyp: Polyp = new Polyp();

  polypRecording: PolypRecording;
  openSnapshotModal = false;
  galleries: Gallery[] = [];
  gallery: Gallery = new Gallery();
  galleryInput: string;
  polypInput: string;
  image: Image = new Image();

  currentTime: number;
  snapshotTime: number;
  videoHTML: HTMLMediaElement;

  deletingPolypRecording = false;
  modalOpened = false;
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
    private timeToNumber: TimeToNumberPipe,
    private galleriesService: GalleriesService,
    private imagesService: ImagesService,
    private notificationService: NotificationService,
  ) {
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    this.videosService.getVideo(id)
      .subscribe(video => {
        this.video = video;
        this.explorationsService.getPolyps(this.video.exploration).subscribe(polyps => this.polyps = polyps);
        this.polypRecordingsService.getPolypRecordingsByVideo(video.id).subscribe(polypRecordings => {
            this.video.polypRecording = polypRecordings;
          }
        );
      });

    this.galleriesService.getGalleries().subscribe(galleries => {
      this.galleries = galleries;
    });
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

  cancel() {
    this.deletingPolypRecording = false;
  }

  onCurrentTimeUpdate(time: number) {
    this.currentTime = time;
  }

  mouseInProgress(move: boolean) {
    this.moveProgress = move;
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

  addPolyp() {
    this.explorationsService.getExploration(this.video.exploration).subscribe(exploration => {
      this.newPolyp.exploration = exploration;
      this.polypsService.createPolyp(this.newPolyp).subscribe(polyp => {
        this.polyps.push(polyp);
        this.newPolyp = new Polyp();
        this.notificationService.success('Polyp registed successfully.', 'Polyp registered.');
        this.selectedPolyp = polyp;
      });
    });
    this.modalOpened = false;
  }

  nameIsUsed(): Boolean {
    return this.polyps.find((polyp) => polyp.name === this.newPolyp.name) !== undefined;
  }

  addPolypRecording() {
    this.polypRecording = {
      id: null,
      video: this.video,
      polyp: this.selectedPolyp,
      start: this.timeToNumber.transform(this.start),
      end: this.timeToNumber.transform(this.end)
    };
    this.polypRecordingsService.createPolypRecording(this.polypRecording)
      .subscribe(
        polypRecording => {
          this.video.polypRecording = this.video.polypRecording.concat(polypRecording);
          this.start = null;
          this.end = null;
          this.selectedPolyp = null;
          this.notificationService.success('Polyp recording registered successfully.', 'Polyp recording registered');
        }
      );
  }

  removePolypRecording(polypRecording: PolypRecording) {
    this.polypRecordingsService.removePolypRecording(polypRecording).subscribe(() => {
        const index = this.video.polypRecording.indexOf(
          this.video.polypRecording.find(
            (polypRecordingFind) => polypRecordingFind === polypRecording));
        this.video.polypRecording.splice(index, 1);
        this.notificationService.success('Polyp recording removed successfully.', 'Polyp recording removed.');
      }
    );
    this.cancel();
  }

  remove(polypRecording: PolypRecording) {
    this.deletingPolypRecording = true;
    this.polypRecording = this.video.polypRecording.find(
      (polypRecordingFind) => polypRecordingFind === polypRecording);
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
    this.openSnapshotModal = true;
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
    return polypRecordings.length > 0 && this.showPolypsInFrame ? polypsInPolypRecording : this.polyps;
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
