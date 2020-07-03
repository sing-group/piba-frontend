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
import {environment} from '../../../environments/environment';
import {ClrDatagridSortOrder} from '@clr/angular';
import {ImageFilter} from '../../models/ImageFilter';

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
  filter = ImageFilter.ALL;
  addPolypLocation = true;

  _galleries: Gallery[] = [];
  role = Role;

  readonly titleOrder: ClrDatagridSortOrder = ClrDatagridSortOrder.UNSORTED;

  constructor(private galleriesService: GalleriesService,
              private imagesService: ImagesService,
              private notificationService: NotificationService,
              public authenticationService: AuthenticationService) {
  }

  private static compareGalleries(g1: Gallery, g2: Gallery): number {
    let diff;
    return ((diff = g1.creationDate.getTime() - g2.creationDate.getTime()) === 0)
      ? ((diff = g1.title.localeCompare(g2.title)) === 0)
        ? g1.id.localeCompare(g2.id)
        : diff
      : -diff;
  }

  ngOnInit() {
    this.galleriesService.listGalleries()
      .subscribe(galleries => this.galleries = galleries);
  }

  get galleries(): Gallery[] {
    return this._galleries;
  }

  set galleries(galleries: Gallery[]) {
    this._galleries = this.sortGalleries(galleries);
  }

  private sortGalleries(galleries: Gallery[]): Gallery[] {
    return galleries.sort((g1, g2) => {
      switch (this.titleOrder) {
        case ClrDatagridSortOrder.ASC:
          return g1.title.localeCompare(g2.title);
        case ClrDatagridSortOrder.DESC:
          return -g1.title.localeCompare(g2.title);
        case ClrDatagridSortOrder.UNSORTED:
          return GalleriesComponent.compareGalleries(g1, g2);
        default:
          throw new Error('Invalid order: ' + this.titleOrder);
      }
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

  hasCurrentGalleryFilteredImages(): boolean {
    return this.countCurrentGalleryFilteredImages() > 0;
  }

  countCurrentGalleryFilteredImages(): number {
    if (Boolean(this.gallery.stats)) {
      switch (this.filter) {
        case ImageFilter.ALL:
          return this.gallery.stats.countImages;
        case ImageFilter.WITH_POLYP_AND_LOCATION:
          return this.gallery.stats.countImagesWithPolypAndLocation;
        case ImageFilter.WITH_POLYP_AND_WITHOUT_LOCATION:
          return this.gallery.stats.countImagesWithPolypAndWithoutLocation;
      case ImageFilter.WITH_POLYP:
        return 1;
        default:
          throw Error('Unsupported filter type: ' + this.filter);
      }
    } else {
      return 0;
    }
  }

  downloadGallery() {
    if (this.filter.includes('WITHOUT_LOCATION')) {
      this.addPolypLocation = false;
    }
    const download = document.getElementById('download-zip') as HTMLAnchorElement;
    if (this.countCurrentGalleryFilteredImages() > 0) {
      download.href = `${environment.restApi}/download/gallery/${this.gallery.id}?filter=${this.filter}` +
        `&withLocation=${this.addPolypLocation}`;
    }

    this.cancel();
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
