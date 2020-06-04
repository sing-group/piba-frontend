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

import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PolypRecording} from '../../models/PolypRecording';
import {PolypRecordingsService} from '../../services/polyprecordings.service';
import {VideoIntervalHighlight} from '../video/VideoIntervalHighlight';
import {areOverlappingIntervals, calculateIntervalSize, Interval, IntervalBoundaries} from '../../models/Interval';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';
import {ExplorationsService} from '../../services/explorations.service';
import {catchError, concatMap, map, mergeMap, tap} from 'rxjs/operators';
import {VideoModificationsService} from '../../services/video-modifications.service';
import {PolypDatasetsService} from '../../services/polyp-datasets.service';
import {PolypRecordingBasicData} from '../../models/PolypRecordingBasicData';
import {VideoModification} from '../../models/VideoModification';
import {VideoSnapshot} from '../video/VideoSnapshot';
import {ImagesService} from '../../services/images.service';
import {LocationResult} from '../locate-polyp-in-image-dialog/locate-polyp-in-image-dialog.component';
import {iif} from 'rxjs/internal/observable/iif';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {PolypDataset} from '../../models/PolypDataset';
import {DataUtils} from '../../utils/data.utils';
import {GalleriesService} from '../../services/galleries.service';
import {Gallery} from '../../models/Gallery';
import {of} from 'rxjs/internal/observable/of';
import {Image} from '../../models/Image';
import {throwError} from 'rxjs/internal/observable/throwError';
import {PolypLocation} from '../../models/PolypLocation';
import {defer} from 'rxjs/internal/observable/defer';
import {VideoComponent} from '../video/video.component';

@Component({
  selector: 'app-polyp-recording-in-dataset',
  templateUrl: './polyp-recording-in-dataset.component.html',
  styleUrls: ['./polyp-recording-in-dataset.component.css']
})
export class PolypRecordingInDatasetComponent implements OnInit {
  private static readonly MODIFICATION_COLOR = 'rgba(241, 213, 117, 1)';
  private static readonly INTERVAL_BOUNDARIES = IntervalBoundaries.BOTH_INCLUDED;

  dataset: PolypDataset;
  datasetId: string;
  polypRecording: PolypRecording;
  polypImages: Image[] = [];

  highlightZones: VideoIntervalHighlight[] = [];
  videoIsReady = false;

  readonly intervalBoundaries = PolypRecordingInDatasetComponent.INTERVAL_BOUNDARIES;

  private polypRecordings: PolypRecordingBasicData[] = [];
  private completePolypRecordings: Map<number, PolypRecording> = new Map<number, PolypRecording>();
  private polypRecordingImages: Map<number, Image[]> = new Map<number, Image[]>();
  private currentIndex: number;
  private currentFrame: number;

  private _snapshot: VideoSnapshot;
  public snapshotDataUrl: string = null;
  public showSnapshotDialog = false;
  private isStoringSnapshot = false;

  public showDeleteConfirmation = false;
  public showDescribePolypDeletionReason = false;
  public imageToDelete: Image = null;

  @ViewChild('canvas') private canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('videoComponent') private video: VideoComponent;

  private static convertFrameToInterval(frame: number, fps: number): Interval {
    const timePerFrame = 1 / fps;

    return {
      start: Number((frame * timePerFrame).toFixed(3)),
      end: Number(((frame + 1) * timePerFrame - 0.001).toFixed(3))
    };
  }

  constructor(
    private readonly changeDetector: ChangeDetectorRef,
    private readonly elementRef: ElementRef,
    private readonly notificationService: NotificationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly datasetsService: PolypDatasetsService,
    private readonly explorationsService: ExplorationsService,
    private readonly galleriesService: GalleriesService,
    private readonly imageService: ImagesService,
    private readonly modificationsService: VideoModificationsService,
    private readonly polypRecordingsService: PolypRecordingsService
  ) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.datasetId = this.route.snapshot.paramMap.get('datasetId');

    this.datasetsService.listAllPolypRecordingBasicData(this.datasetId)
      .subscribe(polypRecordings => {
        this.polypRecordings = polypRecordings;
        this.fillAndChangePolypRecording(id);
      });

    this.datasetsService.getPolypDataset(this.datasetId)
      .pipe(
        concatMap(
          dataset => iif(() => Boolean(dataset.defaultGallery),
            this.galleriesService.getGallery(dataset.defaultGallery as string)
            .pipe(
              tap(gallery => dataset.defaultGallery = gallery),
              map(() => dataset)
            ),
            of(dataset)
          )
        )
      )
      .subscribe(dataset => {
        this.dataset = dataset;
      });
  }

  get duration(): number {
    return this.calculateIntervalDuration(this.polypRecording);
  }

  get modifications() {
    return this.polypRecording.video.modifications
      .filter(modification => areOverlappingIntervals(modification, this.polypRecording, this.intervalBoundaries));
  }

  get snapshot(): VideoSnapshot {
    return this._snapshot;
  }

  set snapshot(snapshot: VideoSnapshot) {
    if (this._snapshot !== snapshot) {
      if (Boolean(snapshot)) {
        this._snapshot = snapshot;
        const canvas = this.canvas.nativeElement;
        canvas.height = snapshot.height;
        canvas.width = snapshot.width;
        canvas.getContext('2d').drawImage(
          snapshot.video, 0, 0, snapshot.width, snapshot.height
        );
        this.snapshotDataUrl = canvas.toDataURL();
      } else {
        this._snapshot = null;
        this.snapshotDataUrl = null;
      }
    }
  }

  get currentImage(): Image {
    return this.polypImages.find(image => this.isInCurrentFrame(image));
  }

  get currentPolypLocation(): PolypLocation {
    return Boolean(this.currentImage) ? this.currentImage.polypLocation : null;
  }

  get showDeleteImage(): boolean {
    return Boolean(this.imageToDelete);
  }

  isLoading(): boolean {
    return !Boolean(this.polypRecording);
  }

  isVideoReady(): boolean {
    return this.videoIsReady;
  }

  hasModifications(): boolean {
    return this.modifications.length > 0;
  }

  hasPrevious(): boolean {
    return this.currentIndex > 0;
  }

  hasNext(): boolean {
    return this.currentIndex < this.polypRecordings.length - 1;
  }

  hasGallery() {
    return Boolean(this.dataset) && Boolean(this.dataset.defaultGallery);
  }

  hasImages() {
    return this.polypImages.length > 0;
  }

  calculateModificationDuration(modification: VideoModification): number {
    return this.calculateIntervalDuration({
      start: Math.max(this.polypRecording.start, modification.start),
      end: Math.min(this.polypRecording.end, modification.end)
    });
  }

  isInCurrentFrame(image: Image) {
    return image.numFrame === this.currentFrame;
  }

  private calculateIntervalDuration(interval: Interval): number {
    return calculateIntervalSize(interval, this.intervalBoundaries);
  }

  onReady() {
    this.videoIsReady = true;
  }

  onGoToPrevious(): void {
    if (!this.hasPrevious()) {
      throw new Error('No previous polyp recording');
    }

    const previous = this.polypRecordings[this.currentIndex - 1];
    this.router.navigateByUrl(`/polypdatasets/${this.datasetId}/polyprecording/${previous.id}`)
      .then(() => this.fillAndChangePolypRecording(previous.id));
  }

  onGoToNext(): void {
    if (!this.hasNext()) {
      throw new Error('No next polyp recording');
    }

    const next = this.polypRecordings[this.currentIndex + 1];
    this.router.navigateByUrl(`/polypdatasets/${this.datasetId}/polyprecording/${next.id}`)
      .then(() => this.fillAndChangePolypRecording(next.id));
  }

  onSnapshot(snapshot: VideoSnapshot): void {
    this.snapshot = snapshot;
    this.showSnapshotDialog = true;
  }

  onTimeChange(time: number): void {
    const timePerFrame = 1 / this.polypRecording.video.fps;

    this.currentFrame = Math.floor(time / timePerFrame);
  }

  onLocatePolypClose(location: LocationResult): void {
    if (location.cancelled) {
      this.snapshot = null;
    } else {
      this.isStoringSnapshot = true;

      if (this.hasGallery()) {
        const gallery = this.dataset.defaultGallery as Gallery;

        const currentImage = this.currentImage;
        const currentPolypLocation = this.currentPolypLocation;

        if (Boolean(currentImage)) {
          if (!Boolean(currentPolypLocation) && Boolean(location.location)) {
            this.imageService.createLocation(
              currentImage.id,
              location.location
            ).subscribe(polypLocation => {
              this.updatePolypLocation(currentImage, polypLocation);
              this.isStoringSnapshot = false;
              this.notificationService.success(
                `Polyp location has added to image '${currentImage.id}.'`,
                'Polyp location stored'
              );
            });
          } else if (Boolean(currentPolypLocation) && !Boolean(location.location)) {
            this.imageService.deleteLocation(currentImage.id)
              .subscribe(() => {
                this.removePolypLocationFromImage(currentImage);
                this.isStoringSnapshot = false;
                this.notificationService.success(
                  `Polyp location has been deleted from image '${currentImage.id}.'`,
                  'Polyp location deleted'
                );
              });
          } else if (!PolypLocation.areEqual(currentPolypLocation, location.location)) {
            this.imageService.modifyLocation(
              currentImage.id,
              location.location
            ).subscribe(polypLocation => {
              this.isStoringSnapshot = false;
              this.updatePolypLocation(currentImage, polypLocation);
              this.notificationService.success(
                `Polyp location has been modified in image '${currentImage.id}.'`,
                'Polyp location modified'
              );
            });
          }
        } else {
          this.imageService.uploadImage({
            image: DataUtils.imageUriToFile(this.snapshotDataUrl),
            gallery: gallery.id,
            manuallySelected: true,
            numFrame: Math.round(this.polypRecording.video.fps * this.snapshot.time),
            observation: '',
            polyp: this.polypRecording.polyp.id,
            video: this.polypRecording.video.id
          })
            .pipe(
              mergeMap(image => iif(
                () => Boolean(location.location),
                defer(() => this.imageService.createLocation(image.id, location.location)
                  .pipe(
                    tap(polypLocation => image.polypLocation = polypLocation),
                    map(() => image)
                  )
                ),
                of(image)
              ))
            )
            .subscribe(image => {
              this.addImage(image);
              this.isStoringSnapshot = false;
              this.notificationService.success(
                `Image has been stored in gallery '${gallery.title}'`,
                'Image stored'
              );
            });
        }
      } else {
        this.notificationService.error(
          'Snapshot image could not be stored as the polyp dataset does not have an assigned gallery.',
          'Image storage fail'
        );
      }
    }
  }

  private changePolypRecording(polypRecording: PolypRecording, images: Image[]) {
    this.polypRecording = polypRecording;
    this.polypImages = images;
    this.highlightZones = this.modifications.map(modification => ({
      interval: modification,
      color: PolypRecordingInDatasetComponent.MODIFICATION_COLOR
    }));
    this.currentIndex = this.polypRecordings.findIndex(value => value.id === polypRecording.id);
  }

  private fillAndChangePolypRecording(id: number) {
    this.polypRecording = null;
    this.videoIsReady = false;
    this.changeDetector.detectChanges();

    if (this.completePolypRecordings.has(id)) {
      this.changePolypRecording(
        this.completePolypRecordings.get(id),
        this.polypRecordingImages.get(id)
      );
    } else {
      this.polypRecordingsService.getPolypRecording(id)
        .pipe(
          concatMap(polypRecording =>
            forkJoin(
              this.explorationsService.getExploration((polypRecording.video.exploration as string)),
              this.modificationsService.listVideoModifications(polypRecording.video.id),
              this.imageService.listImagesByPolyp(polypRecording.polyp)
                .pipe(
                  concatMap(images => iif(
                      () => images.length === 0,
                      of(images),
                      forkJoin(images.map(image => this.imageService.getLocation(image.id).pipe(
                        catchError(err => err.status === 400 ? of(null) : throwError(err))
                      )))
                      .pipe(
                        tap(locations => images.forEach((image, index) => image.polypLocation = locations[index])),
                        map(() => images)
                      )
                    )
                  )
                )
            )
              .pipe(
                map(expModAndImg => {
                  polypRecording.polyp.exploration = expModAndImg[0];
                  polypRecording.video.exploration = expModAndImg[0];
                  polypRecording.video.modifications = expModAndImg[1];

                  return {
                    polypRecording: polypRecording,
                    images: expModAndImg[2]
                  };
                })
              )
          )
        )
        .subscribe(polypRecordingAndImages => {
          const polypRecording = polypRecordingAndImages.polypRecording;
          const images = polypRecordingAndImages.images.filter(image => areOverlappingIntervals(
              polypRecording,
              PolypRecordingInDatasetComponent.convertFrameToInterval(image.numFrame, polypRecording.video.fps),
              IntervalBoundaries.BOTH_INCLUDED
          )).sort((i1, i2) => i1.numFrame - i2.numFrame);

          this.completePolypRecordings.set(polypRecording.id, polypRecording);
          this.polypRecordingImages.set(polypRecording.id, images);
          this.changePolypRecording(polypRecording, images);
        });
    }
  }

  onCancelDeleteImage(): void {
    this.imageToDelete = null;
  }

  onAskForImageDeletionConfirmation(image: Image): void {
    this.imageToDelete = image;
    this.showDeleteConfirmation = true;
  }

  onDeleteImageConfirmed(): void {
    this.showDeleteConfirmation = false;
    this.showDescribePolypDeletionReason = true;
  }

  onDeleteImage(reason: string): void {
    this.showDescribePolypDeletionReason = false;

    if (reason === null) {
      this.imageToDelete = null;
    } else {
      this.imageService.delete(this.imageToDelete.id, 'Discarded')
        .subscribe(() => {
          this.removeImage(this.imageToDelete);
          this.imageToDelete = null;
          this.notificationService.success(
            'Image successfully removed.',
            'Image removed'
          );
        });
    }
  }

  onGoToImage(image: Image): void {
    const fps = this.polypRecording.video.fps;
    this.video.stopVideo((image.numFrame + 0.5) / fps);

    // Scrolls to top
    const parent: HTMLElement = this.elementRef.nativeElement.parentElement;
    if (Boolean(parent)) {
      parent.scrollTo({left: 0, top: 0, behavior: 'smooth'});
    }
  }

  private updatePolypLocation(image: Image, location: PolypLocation): void {
    image.polypLocation = location;
  }

  private removePolypLocationFromImage(image: Image) {
    image.polypLocation = null;
  }

  private addImage(image: Image) {
    this.polypImages.push(image);
    this.polypImages.sort((i1, i2) => i1.numFrame - i2.numFrame);
  }

  private removeImage(image: Image) {
    const imageIndex = this.polypImages.findIndex(i => i.id === image.id);

    if (imageIndex === -1) {
      throw new Error('Image not found');
    } else {
      this.polypImages.splice(imageIndex, 1);
    }
  }


  public trackById(index: number, element: { id: string }): string {
    return element.id;
  }
}
