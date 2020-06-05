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

import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Image} from '../../models/Image';
import {GalleriesService} from '../../services/galleries.service';
import {Gallery} from '../../models/Gallery';
import {PolypLocation} from '../../models/PolypLocation';
import {ImagesService} from '../../services/images.service';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {Location} from '@angular/common';
import {AuthenticationService} from '../../services/authentication.service';
import {Role} from '../../models/User';
import {ImageFilter} from '../../models/ImageFilter';
import {ImageAnnotatorComponent} from '../image-annotator/image-annotator.component';
import {RemoveLocationAction} from './confirm-removing-location-dialog/confirm-removing-location-dialog.component';
import {flatMap, tap} from 'rxjs/operators';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';
import {of} from 'rxjs/internal/observable/of';

enum NavigateTo {
  PREVIOUS, NEXT, GALLERY
}

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.css']
})
export class ImageComponent implements OnInit {
  polypLocation: PolypLocation = null;
  showPolypLocation: boolean;

  private gallery: Gallery = new Gallery();
  private identifiers: string[] = [];
  private filter: ImageFilter;

  private _image: Image = new Image();
  private currentImageId: string;
  private currentImageIndex: number;
  private previousImage: Image = new Image();
  private nextImage: Image = new Image();
  private navigationDirection: NavigateTo = null;

  isLoadingInitialData = false;
  private isStoringLocation = false;
  private isDeletingLocation = false;
  private isDeletingImage = false;
  private isLoadingPrevious = false;
  private isLoadingNext = false;

  showDescribePolypDeletionReason = false;
  showContinueWithoutSavingLocation = false;
  showConfirmRemovingLocation = false;
  showDeleteConfirmation = false;

  @ViewChild('imageAnnotator') private imageAnnotator: ImageAnnotatorComponent;

  constructor(
    private route: ActivatedRoute,
    private galleriesService: GalleriesService,
    private imagesService: ImagesService,
    private notificationService: NotificationService,
    private location: Location,
    private router: Router,
    private readonly authenticationService: AuthenticationService
  ) {
  }

  ngOnInit() {
    const routeSnapshot = this.route.snapshot;
    const imageId = routeSnapshot.paramMap.get('id');
    const galleryId = routeSnapshot.paramMap.get('gallery_id');
    this.filter = ImageFilter[routeSnapshot.queryParamMap.get('filter')];
    this.showPolypLocation = routeSnapshot.queryParamMap.get('show_location') === 'true';

    // This is required to make the isFirstImage, isLastImage, previousImageId and nextImageId properties work
    this.currentImageId = imageId;
    this.isLoadingInitialData = true;

    this.galleriesService.getGallery(galleryId)
      .pipe(
        tap(gallery => this.gallery = gallery),
        flatMap(gallery => this.imagesService.getImagesIdentifiersByGallery(gallery, this.filter)
          .pipe(
            tap(imagesInGalleryInfo => {
              this.identifiers = imagesInGalleryInfo.imagesId;
              this.currentImageIndex = this.identifiers.findIndex(id => id === imageId);
            }),
            flatMap(() =>
              forkJoin(
                this.isFirstImage ? of(null) : this.imagesService.getImage(this.previousImageId),
                this.imagesService.getImage(imageId),
                this.isLastImage ? of(null) : this.imagesService.getImage(this.nextImageId)
              )
            )
          )
        )
      )
      .subscribe(images => {
        this.previousImage = Boolean(images[0]) ? images[0] : null;
        this.image = images[1];
        this.nextImage = Boolean(images[2]) ? images[2] : null;

        this.polypLocation = Boolean(this.image.polypLocation)
          ? this.image.polypLocation.regularize() : null;

        this.isLoadingInitialData = false;
      });
  }

  get isLoading(): boolean {
    return this.isLoadingInitialData ||
      this.isStoringLocation ||
      this.isDeletingLocation ||
      this.isDeletingImage ||
      this.isLoadingPrevious ||
      this.isLoadingNext;
  }

  set image(image: Image) {
    if (this._image !== image) {
      this._image = image;

      if (Boolean(this._image)) {
        this.currentImageId = this._image.id;
        this.currentImageIndex = this.identifiers.findIndex(id => id === this._image.id);
        this.polypLocation = Boolean(this._image.polypLocation) ? this._image.polypLocation.regularize() : null;
      } else {
        this.currentImageId = null;
        this.currentImageIndex = null;
        this.polypLocation = null;
      }
    }
  }

  get image(): Image {
    return this._image;
  }

  get imageUrl(): string {
    return 'data:image/png;base64,' + this.image.base64contents;
  }

  get fileName(): string {
    if (Boolean(this.image) && Boolean(this.image.video)) {
      if (this.hasPolyp()) {
        return this.image.polyp.id + '_' + this.image.video.id + '_' + this.image.numFrame + '.png';
      } else {
        return this.image.video.id + '_' + this.image.numFrame + '.png';
      }
    } else {
      return 'none';
    }
  }

  private get isFirstImage(): boolean {
    return this.currentImageIndex === 0;
  }

  private get isLastImage(): boolean {
    return this.currentImageIndex === this.imageCount - 1;
  }

  private get previousImageId(): string {
    if (this.isFirstImage) {
      return null;
    } else {
      return this.identifiers[this.currentImageIndex - 1];
    }
  }

  private get nextImageId(): string {
    if (this.isLastImage) {
      return null;
    } else {
      return this.identifiers[this.currentImageIndex + 1];
    }
  }

  private get imageCount(): number {
    return this.identifiers.length;
  }

  isEndoscopist(): boolean {
    return this.authenticationService.getRole() === Role.ENDOSCOPIST;
  }

  hasPolyp(): boolean {
    return Boolean(this.image.polyp);
  }

  private hasPreviousImage(): boolean {
    return !this.isFirstImage;
  }

  private hasNextImage(): boolean {
    return !this.isLastImage;
  }

  canGoToPreviousImage(): boolean {
    return !this.isLoadingPrevious && this.hasPreviousImage();
  }

  canGoToNextImage(): boolean {
    return !this.isLoadingNext && this.hasNextImage();
  }

  canClearLocation(): boolean {
    return !this.isLoading && this.showPolypLocation && this.isEndoscopist();
  }

  canRemoveImage() {
    return !this.isLoading && this.isEndoscopist();
  }

  canLocatePolyp() {
    return !this.isLoading && this.showPolypLocation && this.hasPolyp() && this.isEndoscopist();
  }

  canSaveLocation() {
    return !this.isStoringLocation && !this.isLocationSaved() && this.isEndoscopist();
  }

  hasImageObservation(): boolean {
    return Boolean(this.image.observation);
  }

  private isLocationSaved(): boolean {
    return PolypLocation.areEqual(this.polypLocation, this.image.polypLocation);
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if ((event.key === 's' || event.key === 'S') && !this.isLocationSaved()) {
      this.onSave();
    }
  }

  onNavigateToGallery(): void {
    this.navigateTo(NavigateTo.GALLERY);
  }

  onNavigateToPrevious(): void {
    this.navigateTo(NavigateTo.PREVIOUS);
  }

  onNavigateToNext(): void {
    this.navigateTo(NavigateTo.NEXT);
  }

  onSave(): void {
    this.isStoringLocation = true;
    if (!this.isLocationSaved()) {
      if (Boolean(this.polypLocation)) {
        this.imagesService.createLocation(this.currentImageId, this.polypLocation)
          .subscribe(location => {
            this.isStoringLocation = false;
            this.image.polypLocation = location;
            this.polypLocation = location.regularize();
            this.notificationService.success(
              'Polyp location correctly stored.', 'Polyp location stored'
            );
            if (this.isLastImage) {
              this.notificationService.info(
                'There are no more images in this gallery.', 'No images left'
              );
            } else {
              this.navigateToNext();
            }
          });
      } else {
        this.imagesService.deleteLocation(this.currentImageId)
          .subscribe(() => {
            this.isStoringLocation = false;
            this.image.polypLocation = null;
            this.polypLocation = null;
            this.notificationService.success(
              'Polyp location correctly removed.', 'Polyp location removed'
            );
          });
      }
    }
  }

  onClear(): void {
    if (Boolean(this.image.polypLocation)) {
      this.showConfirmRemovingLocation = true;
    } else {
      this.polypLocation = null;
    }
  }

  onTriggerDeletion(): void {
    this.showDeleteConfirmation = true;
  }

  onDeleteConfirmed(): void {
    this.showDeleteConfirmation = false;
    this.showDescribePolypDeletionReason = true;
  }

  onDeleteCancelled(): void {
    this.showDeleteConfirmation = false;
  }

  onContinueWithoutSavingClose(accepted: boolean): void {
    if (accepted) {
      this.navigate();
    }

    this.navigationDirection = null;
  }

  onConfirmRemovingLocationClose(action: RemoveLocationAction): void {
    switch (action) {
      case RemoveLocationAction.DISCARD:
        this.deleteLocation(this.currentImageId);
        break;
      case RemoveLocationAction.ONLY_CLEAR:
        this.polypLocation = null;
        break;
      case RemoveLocationAction.CANCEL:
        break;
      default:
        throw new Error('Unknown action: ' + action);
    }
  }

  onDescribePolypDeletionReason(reason: string): void {
    if (reason !== null) {
      this.isDeletingImage = true;
      this.imagesService.delete(this.currentImageId, reason)
        .subscribe(() => {
          this.isDeletingImage = false;
          this.notificationService.success('Image removed successfully.', 'Image removed.');

          if (this.hasNextImage()) {
            this.navigateToNext(true);
          } else if (this.hasPreviousImage()) {
            this.navigateToPrevious(true);
          } else {
            this.notificationService.info('No images in this gallery', 'No images');
            this.redirectToGallery();
          }
        });
    }
  }

  private navigateTo(direction: NavigateTo): void {
    this.navigationDirection = direction;
    if (this.isLocationSaved()) {
      this.navigate();
    } else {
      this.showContinueWithoutSavingLocation = true;
    }
  }

  private deleteLocation(id: string) {
    this.isDeletingLocation = true;
    this.imagesService.deleteLocation(id)
      .subscribe(() => {
        this.isDeletingLocation = false;
        this.polypLocation = null;
        this.image.polypLocation = null;
        this.notificationService.success(
          'The location of the dataset has been correctly removed ',
          'Polyp location removed'
        );
      });
  }

  private changeUrlToCurrentImage() {
    this.location.go(`gallery/${this.gallery.id}/image/${this.currentImageId}?filter=${ImageFilter[this.filter]}` +
      `&show_location=${this.showPolypLocation}`);
  }

  private loadAsPreviousImage(id: string) {
    if (Boolean(id)) {
      this.isLoadingPrevious = true;
      this.imagesService.getImage(id).subscribe(image => {
        this.previousImage = image;
        this.isLoadingPrevious = false;
      });
    }
  }

  private loadAsNextImage(id: string) {
    if (Boolean(id)) {
      this.isLoadingNext = true;
      this.imagesService.getImage(id).subscribe(image => {
          this.nextImage = image;
          this.isLoadingNext = false;
      });
    }
  }

  private navigateToPrevious(removeCurrentImage: boolean = false): void {
    const isLastImage = this.isLastImage;

    if (removeCurrentImage) {
      const index = this.currentImageIndex;
      this.identifiers.splice(index, 1);
      if (isLastImage) {
        this.nextImage = null;
      } else {
        this.loadAsNextImage(this.identifiers[index + 1]);
      }
    } else {
      this.nextImage = this.image;
    }
    this.image = this.previousImage;
    this.changeUrlToCurrentImage();

    if (this.hasPreviousImage()) {
      this.loadAsPreviousImage(this.identifiers[this.currentImageIndex - 1]);
    } else {
      this.previousImage = null;
    }
  }

  private navigateToNext(removeCurrentImage: boolean = false): void {
    const isFirstImage = this.isFirstImage;

    if (removeCurrentImage) {
      const index = this.currentImageIndex;
      this.identifiers.splice(index, 1);
      if (isFirstImage) {
        this.previousImage = null;
      } else {
        this.loadAsPreviousImage(this.identifiers[index - 1]);
      }
    } else {
      this.previousImage = this.image;
    }
    this.image = this.nextImage;
    this.changeUrlToCurrentImage();

    if (this.hasNextImage()) {
      this.loadAsNextImage(this.identifiers[this.currentImageIndex + 1]);
    } else {
      this.nextImage = null;
    }
  }

  private redirectToGallery() {
    const imageCount = this.imageCount;
    let page = Math.trunc(this.currentImageIndex * (imageCount / 12) / imageCount) + 1;
    if (isNaN(page)) {
      page = 1;
    }
    this.router.navigateByUrl(`gallery/${this.gallery.id}?page=${page}&filter=${ImageFilter[this.filter]}` +
      `&show_location=${this.showPolypLocation}`);
  }

  private navigate() {
    switch (this.navigationDirection) {
      case NavigateTo.GALLERY:
        this.redirectToGallery();
        break;
      case NavigateTo.PREVIOUS:
        this.navigateToPrevious();
        break;
      case NavigateTo.NEXT:
        this.navigateToNext();
        break;
      default:
        throw new Error('Invalid navigation: ' + this.navigationDirection);
    }
  }
}
