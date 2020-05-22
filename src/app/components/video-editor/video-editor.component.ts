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

import {AfterViewChecked, Component, ElementRef, OnInit, Pipe, PipeTransform, ViewChild} from '@angular/core';
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
import {VideoModificationsService} from '../../services/video-modifications.service';
import {ModifiersService} from '../../services/modifiers.service';
import {Modifier} from '../../models/Modifier';
import {Interval} from '../../models/Interval';
import {ElementInVideoZone} from '../../models/ElementInVideoZone';
import {PolypRecording} from '../../models/PolypRecording';
import {VideoModification} from '../../models/VideoModification';
import {VideoSnapshot} from '../video/VideoSnapshot';
import {VideoComponent} from '../video/video.component';
import {VideoIntervalHighlight} from '../video/VideoIntervalHighlight';
import {DataUtils} from '../../utils/data.utils';

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
export class VideoEditorComponent implements AfterViewChecked, OnInit {
  private static readonly MODIFICATION_COLOR = 'rgba(241, 213, 117, 1)';
  private static readonly POLYP_COLOR = 'rgba(0, 198, 194, 0.5)';

  video: Video;

  start: string;
  end: string;

  showPolyp = true;
  showModification = true;

  polyps: Polyp[] = [];
  modifiers: Modifier[] = [];

  polypRecordingZones: ElementInVideoZone[] = [];
  videoModificationZones: ElementInVideoZone[] = [];

  // Snapshot attributes
  openSnapshotModal = false;
  showPolypsInFrame = true;
  showPolypCheckbox = true;
  snapshotPolypInputModel: string;
  galleries: Gallery[] = [];
  gallery: Gallery = new Gallery();
  galleryInputModel: string;
  imageObservation = '';
  snapshotFileName: string;
  private polypForSnapshot: Polyp = new Polyp();

  // Internal attributes
  private image: Image = new Image();

  private currentTime: number;

  private snapshotTime: number;

  @ViewChild('canvas') private canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('videoComponent') private videoComponent: VideoComponent;
  @ViewChild('legendCheckboxContainer') private legendCheckboxContainer: ElementRef<HTMLDivElement>;
  @ViewChild('downloadImageButton') private downloadImageButton: ElementRef<HTMLLinkElement>;

  constructor(
    private videosService: VideosService,
    private route: ActivatedRoute,
    private timePipe: TimePipe,
    private polypsService: PolypsService,
    private explorationsService: ExplorationsService,
    private polypRecordingsService: PolypRecordingsService,
    private modifiersService: ModifiersService,
    private videoModificationsService: VideoModificationsService,
    private timeToNumber: TimeToNumberPipe,
    private galleriesService: GalleriesService,
    private imagesService: ImagesService,
    private notificationService: NotificationService,
    private authenticationService: AuthenticationService,
    private elementRef: ElementRef
  ) {
  }

  private static mapImage(image: Image): ImageUploadInfo {
    return {
      image: null,
      gallery: image.gallery.id,
      video: image.video.id,
      polyp: null,
      numFrame: image.numFrame,
      observation: image.observation,
      manuallySelected: image.manuallySelected
    };
  }

  private static mapImageWithPolyp(image: Image): ImageUploadInfo {
    return {
      image: null,
      gallery: image.gallery.id,
      video: image.video.id,
      polyp: image.polyp.id,
      numFrame: image.numFrame,
      observation: image.observation,
      manuallySelected: image.manuallySelected
    };
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    this.videosService.getVideo(id)
      .subscribe(video => {
        this.video = video;
        this.explorationsService.getPolyps(this.video.exploration)
          .subscribe(polyps =>
            this.polyps = polyps.filter(polyp => !polyp.confirmed)
          );
        this.polypRecordingsService.getPolypRecordingsByVideo(this.video.id).subscribe(polypRecordings => {
          this.video.polypRecording = polypRecordings;
          this.updatePolypRecordingZones();
        });
        this.videoModificationsService.listVideoModifications(this.video.id)
          .subscribe(videoModifications => {
            this.video.modifications = videoModifications;
            this.updateVideoModificationZones();
          });
      });

    this.modifiersService.getModifiers().subscribe((modifiers) => this.modifiers = modifiers);

    this.galleriesService.listGalleries().subscribe(galleries => {
      this.galleries = galleries.sort((galleryA, galleryB) => galleryA.title > galleryB.title ? 1 : -1);
    });

  }

  get highlightZones(): VideoIntervalHighlight[] {
    const highlightZones: VideoIntervalHighlight[] = [];

    if (this.hasVideo()) {
      if (this.showPolyp) {
        this.video.polypRecording.map(polypRecording => ({
          color: VideoEditorComponent.POLYP_COLOR,
          interval: {
            start: polypRecording.start,
            end: polypRecording.end
          }
        })).forEach(zone => highlightZones.push(zone));
      }

      if (this.showModification) {
        this.video.modifications.map(modification => ({
          color: VideoEditorComponent.MODIFICATION_COLOR,
          interval: {
            start: modification.start,
            end: modification.end
          }
        })).forEach(zone => highlightZones.push(zone));
      }
    }

    return highlightZones;
  }

  ngAfterViewChecked() {
    if (this.hasVideo() && !isNaN(this.videoComponent.duration)) {
      // assign the width of the video to the legends and checkboxes container
      this.legendCheckboxContainer.nativeElement.style.width = this.videoComponent.offsetWidth + 'px';
    }
  }

  private updatePolypRecordingZones() {
    this.polypRecordingZones = this.video.polypRecording.map(
      polypRecording => ({
        id: polypRecording.id,
        element: polypRecording.polyp,
        start: polypRecording.start,
        end: polypRecording.end,
        confirmed: polypRecording.confirmed
      })
    );
  }

  private updateVideoModificationZones() {
    this.videoModificationZones = this.video.modifications.map(
      videoModification => ({
        id: videoModification.id,
        element: videoModification.modifier,
        start: videoModification.start,
        end: videoModification.end,
        confirmed: videoModification.confirmed
      })
    ).sort((zoneA: ElementInVideoZone, zoneB: ElementInVideoZone) => zoneA.element.name < zoneB.element.name ? -1 : 1);
  }

  hasVideo(): boolean {
    return this.video !== undefined && this.video !== null;
  }

  isEndoscopist(): boolean {
    return this.authenticationService.getRole() === Role.ENDOSCOPIST;
  }

  stopAtSecondStart(): string {
    this.currentTime = this.videoComponent.stopAtSecondStart();

    return this.transformToTimePipe();
  }

  stopAtSecondEnd(): string {
    this.currentTime = this.videoComponent.stopAtSecondEnd();

    return this.transformToTimePipe();
  }

  transformToTimePipe(): string {
    if (this.currentTime === undefined) {
      return this.timePipe.transform(0);
    } else {
      return this.timePipe.transform(this.currentTime);
    }
  }

  onTimeUpdate(time: number) {
    this.currentTime = time;
  }

  isValidInterval(interval: Interval): boolean {
    return this.videoComponent.isValidInterval(interval);
  }

  private scrollToTop() {
    const parent: HTMLElement = this.elementRef.nativeElement.parentElement;

    if (parent !== undefined) {
      parent.scrollTo({left: 0, top: 0, behavior: 'smooth'});
    }
  }

  playInterval(interval: Interval) {
    this.scrollToTop();
    this.videoComponent.playInterval(interval);
  }

  onSnapshot(snapshot: VideoSnapshot) {
    this.snapshotTime = snapshot.time;

    const canvas = this.canvas.nativeElement;
    canvas.height = snapshot.height;
    canvas.width = snapshot.width;
    canvas.getContext('2d').drawImage(
      snapshot.video, 0, 0, snapshot.width, snapshot.height
    );

    this.showPolypCheckbox = this.getPolypsForSnapshot().length !== this.polyps.length;
    this.snapshotFileName = this.video.id + '_' + Math.round(this.video.fps * this.snapshotTime) + '.png';
    this.openSnapshotModal = true;
  }

  downloadSnapshot() {
    this.downloadImageButton.nativeElement.href = this.canvas.nativeElement.toDataURL();
    this.discardSnapshot();
  }

  saveSnapshot() {
    this.currentTime = this.snapshotTime;
    this.image.video = this.video;
    this.image.gallery = this.gallery;
    this.image.polyp = this.polypForSnapshot;
    this.image.numFrame = Math.round(this.image.video.fps * this.snapshotTime);
    this.image.base64contents = this.canvas.nativeElement.toDataURL();
    this.image.observation = this.imageObservation;
    this.image.manuallySelected = true;

    let imageUploadInfo;
    if (this.snapshotPolypInputModel !== '' && this.snapshotPolypInputModel !== undefined) {
      imageUploadInfo = VideoEditorComponent.mapImageWithPolyp(this.image);
    } else {
      imageUploadInfo = VideoEditorComponent.mapImage(this.image);
    }
    imageUploadInfo.image = DataUtils.imageUriToFile(this.image.base64contents);

    this.discardSnapshot();

    this.imagesService.uploadImage(imageUploadInfo).subscribe(() => {
      this.notificationService.success('Image registered successfully.', 'Image registered.');
    });
  }

  doesGalleryNotExists(): boolean {
    return this.galleries.filter(gallery => gallery.title === this.galleryInputModel).length <= 0 ||
      this.gallery.title !== this.galleryInputModel;
  }

  isPolypCorrect() {
    return this.polypForSnapshot.name === this.snapshotPolypInputModel || this.snapshotPolypInputModel === '';
  }

  selectGallery(gallery: Gallery) {
    this.galleryInputModel = gallery.title;
    this.gallery = gallery;
  }

  selectPolypForSnapshot(polyp: Polyp) {
    this.snapshotPolypInputModel = polyp.name;
    this.polypForSnapshot = polyp;
  }

  getPolypsForSnapshot(): Polyp[] {
    let polyps = this.polyps;

    if (this.showPolypsInFrame) {
      const polypRecordingsInSnapshot = this.video.polypRecording
        .filter(polypRecording => this.snapshotTime >= polypRecording.start && this.snapshotTime <= polypRecording.end)
        .map(polypRecording => polypRecording.polyp);

      if (polypRecordingsInSnapshot.length > 0) {
        polyps = polypRecordingsInSnapshot;
      }
    }

    return polyps.sort((polypA, polypB) => polypA.name > polypB.name ? 1 : -1);
  }

  discardSnapshot() {
    this.openSnapshotModal = false;
    this.gallery = new Gallery();
    this.galleryInputModel = '';
    this.polypForSnapshot = new Polyp();
    this.snapshotPolypInputModel = '';
    this.imageObservation = '';
    this.showPolypsInFrame = true;
  }

  onAddPolyp(newPolypName: string) {
    const newPolyp = new Polyp();
    newPolyp.name = newPolypName;

    this.explorationsService.addPolypToExploration(newPolyp, this.video.exploration as string)
      .subscribe(polyp => {
        this.polyps.push(polyp);
        this.notificationService.success('Polyp registered successfully.', 'Polyp registered.');
      });
  }

  onAddPolypRecording(videoZone: ElementInVideoZone) {
    const polypRecording = {
      id: null,
      video: this.video,
      polyp: <Polyp>videoZone.element,
      start: videoZone.start,
      end: videoZone.end,
      confirmed: false
    };
    this.polypRecordingsService.createPolypRecording(polypRecording)
      .subscribe(
        polypRecordingCreated => {
          this.video.polypRecording = this.video.polypRecording.concat(polypRecordingCreated);
          this.updatePolypRecordingZones();
          this.notificationService.success('Polyp recording registered successfully.', 'Polyp recording registered');
        }
      );
  }

  onRemovePolypRecording(polypRecordingId: number) {
    this.polypRecordingsService.removePolypRecording(polypRecordingId).subscribe(
      () => {
        const index = this.video.polypRecording.indexOf(
          this.video.polypRecording.find(polypRecording => polypRecording.id === polypRecordingId)
        );
        this.video.polypRecording.splice(index, 1);
        this.updatePolypRecordingZones();
        this.notificationService.success('Polyp recording removed successfully.', 'Polyp recording removed.');
      }
    );
  }

  onConfirmPolypRecording(polypRecordingId: number) {
    const polypRecordingToConfirm = this.video.polypRecording.find(polypRecording => polypRecording.id === polypRecordingId);
    const polypRecordingConfirmed: PolypRecording = {
      id: polypRecordingId,
      video: this.video,
      polyp: polypRecordingToConfirm.polyp,
      start: polypRecordingToConfirm.start,
      end: polypRecordingToConfirm.end,
      confirmed: true
    };

    this.polypRecordingsService.editPolypRecording(polypRecordingConfirmed).subscribe(updatedPolypRecording => {
      Object.assign(this.video.polypRecording.find((polypRecording) => polypRecording.id === updatedPolypRecording.id),
        updatedPolypRecording);
      this.updatePolypRecordingZones();
      this.notificationService.success('Polyp recording confirmed successfully.', 'Polyp recording confirmed.');
    });

  }

  onConfirmAllPolypRecordings() {
    const polypRecordingsToBeConfirmed: PolypRecording[] = [];
    this.video.polypRecording.filter(polypRecording => polypRecording.confirmed === false).forEach(
      unconfirmedPolypRecording => {
        const polypRecordingToBeConfirmed: PolypRecording = {
          id: unconfirmedPolypRecording.id,
          video: this.video,
          polyp: unconfirmedPolypRecording.polyp,
          start: unconfirmedPolypRecording.start,
          end: unconfirmedPolypRecording.end,
          confirmed: true
        };
        polypRecordingsToBeConfirmed.push(polypRecordingToBeConfirmed);
      });

    this.polypRecordingsService.editPolypRecordings(polypRecordingsToBeConfirmed).subscribe(updatedPolypRecordings => {
      updatedPolypRecordings.forEach(updatedPolypRecording => {
        Object.assign(this.video.polypRecording.find((polypRecording) => {
            return polypRecording.id === updatedPolypRecording.id;
          }
        ), updatedPolypRecording);
      });
      this.updatePolypRecordingZones();
      this.notificationService.success('All polyp recordings were confirmed.', 'Polyp recordings confirmed');
    });
  }

  onAddVideoModification(videoZone: ElementInVideoZone) {
    const videoModification = {
      id: null,
      video: this.video,
      modifier: <Modifier>videoZone.element,
      start: videoZone.start,
      end: videoZone.end,
      confirmed: false
    };
    this.videoModificationsService.createVideoModification(videoModification).subscribe(videoModificationCreated => {
        this.video.modifications = this.video.modifications.concat(videoModificationCreated);
        this.updateVideoModificationZones();
        this.notificationService.success('Video modification registered successfully.', 'Video modification registered.');
      }
    );
  }

  onRemoveVideoModification(videoModificationId: number) {
    this.videoModificationsService.removeVideoModification(videoModificationId).subscribe(
      () => {
        const index = this.video.modifications.indexOf(
          this.video.modifications.find(videoModification => videoModification.id === videoModificationId)
        );
        this.video.modifications.splice(index, 1);
        this.updateVideoModificationZones();
        this.notificationService.success('Video modifier removed successfully.', 'Video modifier removed');
      }
    );
  }

  onConfirmVideoModification(videoModificationId: number) {
    const videoModificationToConfirm = this.video.modifications.find(videoModification => videoModification.id === videoModificationId);
    const videoModificationConfirmed: VideoModification = {
      id: videoModificationId,
      video: this.video,
      modifier: videoModificationToConfirm.modifier,
      start: videoModificationToConfirm.start,
      end: videoModificationToConfirm.end,
      confirmed: true
    };

    this.videoModificationsService.editVideoModification(videoModificationConfirmed).subscribe(updatedVideoModification => {
      Object.assign(this.video.modifications.find((videoModification) => videoModification.id === updatedVideoModification.id),
        updatedVideoModification);
      this.updateVideoModificationZones();
      this.notificationService.success('Video modification confirmed successfully.', 'Video modification confirmed.');
    });

  }

  onConfirmAllVideoModifications() {
    const modificationsToBeConfirmed: VideoModification[] = [];
    this.video.modifications.filter(modifier => modifier.confirmed === false).forEach(
      unconfirmedModification => {
        const modificationToBeConfirmed: VideoModification = new VideoModification();
        Object.assign(modificationToBeConfirmed, unconfirmedModification);
        modificationsToBeConfirmed.push(modificationToBeConfirmed);
      });

    modificationsToBeConfirmed.forEach(modification => modification.confirmed = true);

    this.videoModificationsService.editVideoModifications(modificationsToBeConfirmed).subscribe(updatedModifications => {
      updatedModifications.forEach(updatedModification => {
        Object.assign(this.video.modifications.find((modification) => {
            return modification.id === updatedModification.id;
          }
        ), updatedModification);
      });
      this.updateVideoModificationZones();
      this.notificationService.success('All video modifications were confirmed.', 'Video modifications confirmed');
    });
  }
}
