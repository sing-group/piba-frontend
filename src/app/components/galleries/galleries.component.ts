import {Component, OnInit} from '@angular/core';
import {Gallery} from '../../models/Gallery';
import {GalleriesService} from '../../services/galleries.service';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {Role} from '../../models/User';
import {AuthenticationService} from '../../services/authentication.service';
import {ImagesService} from '../../services/images.service';
import {ImagesInGalleryInfo} from '../../services/entities/ImagesInGalleryInfo';
import {environment} from '../../../environments/environment';


@Component({
  selector: 'app-galleries',
  templateUrl: './galleries.component.html',
  styleUrls: ['./galleries.component.css']
})
export class GalleriesComponent implements OnInit {

  creatingGallery = false;
  editingGallery = false;
  downloadingGallery = false;
  gallery: Gallery = new Gallery();
  loadingImagesInGalleryInfo = false;
  filter = 'all';
  addPolypLocation = false;

  restApi = environment.restApi;

  imagesInGalleryInfoMap = new Map();
  galleries: Gallery[] = [];
  role = Role;

  constructor(private galleriesService: GalleriesService,
              private imagesService: ImagesService,
              private notificationService: NotificationService,
              public authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.galleriesService.getGalleries().subscribe((galleries) => {
      this.galleries = galleries;
      if (galleries.length > 0) {
        this.loadingImagesInGalleryInfo = true;
      }
      galleries.forEach(gallery => {
        this.imagesService.getImagesIdentifiersByGallery(gallery, 'all').subscribe(imagesInGalleryInfo => {
          this.imagesInGalleryInfoMap.set(gallery.id, imagesInGalleryInfo);
          if (galleries.length === this.imagesInGalleryInfoMap.size) {
            this.loadingImagesInGalleryInfo = false;
          }
        });
      });
    });
  }

  save() {
    if (this.creatingGallery) {
      this.galleriesService.createGallery(this.gallery).subscribe(
        (newGallery) => {
          this.galleries = this.galleries.concat(newGallery);
          this.notificationService.success('Gallery registered successfully.', 'Gallery registered.');
          this.cancel();
        });
    } else {
      this.galleriesService.editGallery(this.gallery).subscribe(updated => {
          Object.assign(this.galleries.find((gallery) => gallery.id === this.gallery.id), updated);
          this.notificationService.success('Gallery edited successfully.', 'Gallery edited.');
          this.cancel();
        }
      );
    }
  }

  edit(id: string) {
    this.editingGallery = true;
    this.gallery = new Gallery();
    Object.assign(this.gallery, this.galleries.find((gallery) => gallery.id === id));
  }

  download(id: string) {
    this.downloadingGallery = true;
    this.gallery = new Gallery();
    Object.assign(this.gallery, this.galleries.find((gallery) => gallery.id === id));
  }

  getNumberOfImagesAccordingToFilter(): number {
    let totalImages = 0;
    const imagesInGalleryInfo = this.getImagesInGalleryInfo(this.gallery);

    if (imagesInGalleryInfo !== undefined) {
      switch (this.filter) {
        case 'all':
          totalImages = imagesInGalleryInfo.totalItems;
          break;
        case 'located':
          totalImages = imagesInGalleryInfo.locatedImages;
          break;
        case 'not_located':
          totalImages = imagesInGalleryInfo.totalItems - imagesInGalleryInfo.locatedImages;
          break;
        case 'not_located_with_polyp':
          totalImages = imagesInGalleryInfo.imagesWithPolyp - imagesInGalleryInfo.locatedImages;
          break;
      }
    }

    return totalImages;
  }

  downloadGalley() {
    if (this.filter.includes('not_located')) {
      this.addPolypLocation = false;
    }
    const download = document.getElementById('download-zip') as HTMLAnchorElement;
    if (this.getNumberOfImagesAccordingToFilter() > 0) {
      download.href = this.restApi + '/download/gallery/' + this.gallery.id + '/' + this.filter + '/' + this.addPolypLocation;
    }

    this.cancel();
  }

  getImagesInGalleryInfo(gallery: Gallery): ImagesInGalleryInfo {
    if (!this.loadingImagesInGalleryInfo) {
      return this.imagesInGalleryInfoMap.get(gallery.id);
    } else {
      return {
        totalItems: 0,
        imagesWithPolyp: 0,
        locatedImages: 0,
        imagesId: []
      };
    }
  }

  getPercentageOfLocatedPolyps(gallery: Gallery): number {
    if (this.getImagesInGalleryInfo(gallery) === undefined || this.getImagesInGalleryInfo(gallery).imagesWithPolyp === 0) {
      return 100;
    } else {
      return (this.getImagesInGalleryInfo(gallery).locatedImages * 100) / this.getImagesInGalleryInfo(gallery).imagesWithPolyp;
    }
  }

  cancel() {
    this.gallery = new Gallery();
    this.creatingGallery = false;
    this.editingGallery = false;
    this.downloadingGallery = false;
    this.filter = 'all';
    this.addPolypLocation = false;
  }

}
