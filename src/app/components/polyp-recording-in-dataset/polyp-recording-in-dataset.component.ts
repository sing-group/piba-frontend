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
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
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
import {VideoSpeed} from '../video/VideoSpeed';
import {SortDirection} from '../../services/entities/SortDirection';
import {PolypRecordingInDatasetBasicData} from '../../models/PolypRecordingInDatasetBasicData';

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

  private polypRecordings: PolypRecordingInDatasetBasicData[] = [];
  private imagesSort: { images: SortDirection };
  private completePolypRecordings: Map<number, PolypRecording> = new Map<number, PolypRecording>();
  private polypRecordingImages: Map<number, Image[]> = new Map<number, Image[]>();
  private currentIndex: number;
  private newIndex?: number;
  private currentFrame: number;

  private _snapshot: VideoSnapshot;
  public snapshotDataUrl: string = null;
  public showSnapshotDialog = false;
  private isStoringSnapshot = false;

  public showDeleteConfirmation = false;
  public showDescribePolypDeletionReason = false;
  public imageToDelete: Image = null;

  public videoSpeed = VideoSpeed.FRAMES_1;

  @ViewChild('canvas') private canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('videoComponent') private video: VideoComponent;

  public markModalOpened = false;
  public secondaryMarkAction?: string;

  private static convertFrameToInterval(frame: number, fps: number): Interval {
    return {
      start: PolypRecordingInDatasetComponent.convertFrameToTime(frame, fps),
      end: PolypRecordingInDatasetComponent.convertFrameToTime(frame + 1, fps)
    };
  }

  private static convertTimeToFrame(time: number, fps: number): number {
    return Math.floor(time * fps);
  }

  private static convertFrameToTime(frame: number, fps: number): number {
    return Number((frame / fps).toFixed(3));
  }

  private static convertPolypRecordingToInterval(polypRecording: PolypRecording): Interval {
    switch (PolypRecordingInDatasetComponent.INTERVAL_BOUNDARIES) {
      case IntervalBoundaries.BOTH_INCLUDED:
        return {
          start: polypRecording.start,
          end: polypRecording.end + 0.999 // Adjustment to completely include the last second
        };
      // In case default boundaries are changed, other calculations should be added
      default:
        throw new Error('Interval boundaries not supported');
    }
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
    private readonly imagesService: ImagesService,
    private readonly modificationsService: VideoModificationsService,
    private readonly polypRecordingsService: PolypRecordingsService
  ) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.datasetId = this.route.snapshot.paramMap.get('datasetId');
    const imagesSortDirection = SortDirection[this.route.snapshot.queryParamMap.get('imagesSort')];
    this.imagesSort = Boolean(imagesSortDirection) ? { images: imagesSortDirection } : undefined;


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

        this.datasetsService.listAllPolypRecordingBasicData(this.datasetId, this.imagesSort)
          .subscribe(polypRecordings => {
            this.polypRecordings = polypRecordings;
            this.fillAndChangePolypRecording(id);
          });
      });
  }

  get duration(): number {
    return this.calculateIntervalDuration(this.polypRecording);
  }

  get modifications() {
    const polypRecordingInterval = PolypRecordingInDatasetComponent.convertPolypRecordingToInterval(this.polypRecording);
    return this.polypRecording.video.modifications
      .filter(modification => areOverlappingIntervals(modification, polypRecordingInterval, this.intervalBoundaries));
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

  isCurrentPolypRecordingReviewed(): boolean {
    return this.polypRecordings.some(pr => pr.id === this.polypRecording.id && pr.reviewed);
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

  hasCurrentImage() {
    return Boolean(this.currentImage);
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
    this.goToByDisplacement(-1);
  }

  onGoToNext(): void {
    this.goToByDisplacement(1);
  }

  onSnapshot(snapshot: VideoSnapshot): void {
    this.snapshot = snapshot;
    this.showSnapshotDialog = true;
  }

  onTimeChange(time: number): void {
    this.currentFrame = PolypRecordingInDatasetComponent.convertTimeToFrame(time, this.polypRecording.video.fps);
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
            this.imagesService.createLocation(
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
            this.imagesService.deleteLocation(currentImage.id)
              .subscribe(() => {
                this.removePolypLocationFromImage(currentImage);
                this.isStoringSnapshot = false;
                this.notificationService.success(
                  `Polyp location has been deleted from image '${currentImage.id}.'`,
                  'Polyp location deleted'
                );
              });
          } else if (!PolypLocation.areEqual(currentPolypLocation, location.location)) {
            this.imagesService.modifyLocation(
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
          this.imagesService.uploadImage({
            image: DataUtils.imageUriToFile(this.snapshotDataUrl),
            gallery: gallery.id,
            manuallySelected: true,
            numFrame: PolypRecordingInDatasetComponent.convertTimeToFrame(this.snapshot.time, this.polypRecording.video.fps),
            observation: location.observation,
            polyp: this.polypRecording.polyp.id,
            video: this.polypRecording.video.id
          })
            .pipe(
              mergeMap(image => iif(
                () => Boolean(location.location),
                defer(() => this.imagesService.createLocation(image.id, location.location)
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
      this.imagesService.delete(this.imageToDelete.id, 'Discarded')
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
    const time = PolypRecordingInDatasetComponent.convertFrameToTime(image.numFrame + 0.5, this.polypRecording.video.fps);
    this.video.stopVideo(time);

    // Scrolls to top
    const parent: HTMLElement = this.elementRef.nativeElement.parentElement;
    if (Boolean(parent)) {
      parent.scrollTo({left: 0, top: 0, behavior: 'smooth'});
    }
  }

  private goToByDisplacement(displacement: number): void {
    const newIndex = this.currentIndex + displacement;

    if (newIndex < 0 || newIndex >= this.polypRecordings.length) {
      throw new Error('New polyp index out of bounds: ' + newIndex);
    }

    if (this.isCurrentPolypRecordingReviewed()) {
      this.goToIndex(newIndex);
    } else {
      this.newIndex = newIndex;
      this.secondaryMarkAction = 'Continue without mark';
      this.markModalOpened = true;
    }
  }

  private goToIndex(newIndex: number): void {
    const polypRecordingId = this.polypRecordings[newIndex].id;
    this.router.navigate(['polypdatasets', this.datasetId, 'polyprecording', polypRecordingId], this.createNavigationExtras())
      .then(() => this.fillAndChangePolypRecording(polypRecordingId));
  }

  private createNavigationExtras(): NavigationExtras {
    if (Boolean(this.imagesSort)) {
      return {
        queryParams: this.imagesSort
      };
    } else {
      return undefined;
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
              iif(() => Boolean(this.dataset.defaultGallery),
                defer(() =>
                  this.imagesService.listImagesByPolypAndGallery(polypRecording.polyp, this.dataset.defaultGallery as Gallery)
                    .pipe(
                      concatMap(images => iif(
                          () => images.length === 0,
                          of(images),
                          forkJoin(images.map(image => this.imagesService.getLocation(image.id).pipe(
                            catchError(err => err.status === 400 ? of(null) : throwError(err))
                          )))
                          .pipe(
                            tap(locations => images.forEach((image, index) => image.polypLocation = locations[index])),
                            map(() => images)
                          )
                        )
                      )
                    )
                ),
                of([] as Image[])
              )
            )
            .pipe(
              map(expModAndImg => {
                polypRecording.polyp.exploration = expModAndImg[0];
                polypRecording.video.exploration = expModAndImg[0];
                polypRecording.video.modifications = expModAndImg[1];
                expModAndImg[2].forEach(image => image.polyp = polypRecording.polyp);

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
          const polypRecordingInterval = PolypRecordingInDatasetComponent.convertPolypRecordingToInterval(polypRecording);
          const images = polypRecordingAndImages.images
            .filter(image => areOverlappingIntervals(
              polypRecordingInterval,
              PolypRecordingInDatasetComponent.convertFrameToInterval(image.numFrame, polypRecording.video.fps),
              IntervalBoundaries.BOTH_INCLUDED
            ))
            .sort((i1, i2) => i1.numFrame - i2.numFrame);

          this.completePolypRecordings.set(polypRecording.id, polypRecording);
          this.polypRecordingImages.set(polypRecording.id, images);
          this.changePolypRecording(polypRecording, images);
        });
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

  public onMarkAsReviewed() {
    this.markModalOpened = true;
  }

  public onCancelMark() {
    this.newIndex = undefined;
    this.secondaryMarkAction = undefined;
    this.markModalOpened = false;
  }

  public onConfirmMark() {
    this.datasetsService.markPolypDatasetAsReviewed(this.datasetId, this.polypRecording.id)
      .subscribe(() => {
        this.polypRecordings.find(pr => pr.id === this.polypRecording.id).reviewed = true;
        this.markModalOpened = false;
        this.secondaryMarkAction = undefined;
        if (this.newIndex !== undefined) {
          this.goToIndex(this.newIndex);
          this.newIndex = undefined;
        }
      });
  }

  public onConfirmWithoutMark() {
    this.markModalOpened = false;
    this.secondaryMarkAction = undefined;

    if (this.newIndex !== undefined) {
      this.goToIndex(this.newIndex);
      this.newIndex = undefined;
    }
  }
}
