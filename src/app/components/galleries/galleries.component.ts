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

import {Component, OnInit} from '@angular/core';
import {Gallery} from '../../models/Gallery';
import {GalleriesService} from '../../services/galleries.service';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {Role} from '../../models/User';
import {AuthenticationService} from '../../services/authentication.service';
import {ImagesService} from '../../services/images.service';
import {ImagesInGalleryInfo} from '../../services/entities/ImagesInGalleryInfo';
import {environment} from '../../../environments/environment';
import {ClrDatagridSortOrder} from '@clr/angular';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';
import {ImageFilter} from '../../models/ImageFilter';

class GallerySummary {
  id: string;
  title: string;
  description: string;
  imagesLocated: number;
  totalImages: number;
  locatedPercentage: number;
}

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
  filter = ImageFilter.ALL;
  addPolypLocation = true;

  restApi = environment.restApi;

  imagesInGalleryInfoMap = new Map();
  _galleries: Gallery[] = [];
  _galleriesData: GallerySummary[] = [];
  role = Role;

  readonly ascOrder = ClrDatagridSortOrder.ASC;

  constructor(private galleriesService: GalleriesService,
              private imagesService: ImagesService,
              private notificationService: NotificationService,
              public authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.galleriesService.getGalleries().subscribe(galleries => this.galleries = galleries);
  }

  get galleries(): Gallery[] {
    return this._galleries;
  }

  set galleries(galleries: Gallery[]) {
    this._galleries = galleries;

    const newGalleries = this._galleries
      .filter(gallery => !this.imagesInGalleryInfoMap.has(gallery.id));

    console.log(newGalleries);
    if (newGalleries.length > 0) {
      this.loadingImagesInGalleryInfo = true;

      forkJoin(newGalleries.map(gallery => this.imagesService.getImagesIdentifiersByGallery(gallery)))
        .subscribe(imagesInGalleriesInfo => {
          imagesInGalleriesInfo.forEach((imagesInGalleryInfo, index) => {
            const gallery = newGalleries[index];
            this.imagesInGalleryInfoMap.set(gallery.id, imagesInGalleryInfo);
          });

          this.updateGalleriesData();

          this.loadingImagesInGalleryInfo = false;
        });
    }
  }

  get galleriesData(): GallerySummary[] {
    return this._galleriesData;
  }

  private updateGalleriesData() {
    this._galleriesData = this._galleries.map(gallery => {
      const imagesInGalleryInfo = this.getImagesInGalleryInfo(gallery);

      return ({
        id: gallery.id,
        title: gallery.title,
        description: gallery.description,
        imagesLocated: imagesInGalleryInfo !== undefined ? imagesInGalleryInfo.locatedImages : 0,
        totalImages: imagesInGalleryInfo !== undefined ? imagesInGalleryInfo.totalItems : 0,
        locatedPercentage: this.getPercentageOfLocatedPolyps(imagesInGalleryInfo)
      });
    });
  }

  get sortedGalleries() {
    return this.galleries.sort((g1, g2) => {
      const compare = g1.title.localeCompare(g2.title);

      return this.ascOrder === ClrDatagridSortOrder.ASC ? compare : -compare;
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
        case ImageFilter.ALL:
          totalImages = imagesInGalleryInfo.totalItems;
          break;
        case ImageFilter.LOCATED:
          totalImages = imagesInGalleryInfo.locatedImages;
          break;
        case ImageFilter.UNLOCATED:
          totalImages = imagesInGalleryInfo.totalItems - imagesInGalleryInfo.locatedImages;
          break;
        case ImageFilter.UNLOCATED_WITH_POLYP:
          totalImages = imagesInGalleryInfo.imagesWithPolyp - imagesInGalleryInfo.locatedImages;
          break;
      }
    }

    return totalImages;
  }

  downloadGallery() {
    if (this.filter.includes('not_located')) {
      this.addPolypLocation = false;
    }
    const download = document.getElementById('download-zip') as HTMLAnchorElement;
    if (this.getNumberOfImagesAccordingToFilter() > 0) {
      download.href = `${this.restApi}/download/gallery/${this.gallery.id}?filter=${this.filter}&withLocation=${this.addPolypLocation}`;
    }

    this.cancel();
  }

  getImagesInGalleryInfo(gallery: Gallery): ImagesInGalleryInfo {
    if (this.imagesInGalleryInfoMap.has(gallery.id)) {
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

  getPercentageOfLocatedPolyps(imagesInGallery: ImagesInGalleryInfo): number {
    if (imagesInGallery === undefined || imagesInGallery.imagesWithPolyp === 0) {
      return 100;
    } else {
      return ((imagesInGallery.imagesWithPolyp + imagesInGallery.locatedImages - imagesInGallery.imagesWithPolyp)
        / imagesInGallery.totalItems) * 100;
    }
  }

  cancel() {
    this.gallery = new Gallery();
    this.creatingGallery = false;
    this.editingGallery = false;
    this.downloadingGallery = false;
    this.filter = ImageFilter.ALL;
    this.addPolypLocation = true;
  }

}
