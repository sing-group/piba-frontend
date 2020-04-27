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

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Gallery} from '../models/Gallery';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';
import {GalleryInfo} from './entities/GalleryInfo';
import {Image} from '../models/Image';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GalleriesService {

  constructor(private http: HttpClient) {
  }

  getGalleries(): Observable<Gallery[]> {
    return this.http.get<GalleryInfo[]>(`${environment.restApi}/gallery/`)
      .pipe(
        map(galleries => galleries.map(this.mapGalleryInfo.bind(this)))
      );
  }

  getGallery(id: string): Observable<Gallery> {
    return this.http.get<GalleryInfo>(`${environment.restApi}/gallery/${id}`).pipe(map(galleryInfo =>
      this.mapGalleryInfo(galleryInfo, null)
    ));
  }

  createGallery(gallery: Gallery): Observable<Gallery> {
    const galleryInfo = this.toGalleryInfo(gallery, null);
    return this.http.post<GalleryInfo>(`${environment.restApi}/gallery`, galleryInfo)
      .pipe(
        map(this.mapGalleryInfo.bind(this))
      );
  }

  editGallery(gallery: Gallery): Observable<Gallery> {
    const galleryInfo = this.toGalleryInfo(gallery, null);
    return this.http.put<GalleryInfo>(`${environment.restApi}/gallery/${galleryInfo.id}`, galleryInfo)
      .pipe(
        map(this.mapGalleryInfo.bind(this))
      );
  }

  private mapGalleryInfo(galleryInfo: GalleryInfo, images: Image[]): Gallery {
    return {
      id: galleryInfo.id,
      title: galleryInfo.title,
      description: galleryInfo.description,
    };
  }

  private toGalleryInfo(gallery: Gallery, images: Image[]): Gallery {
    return {
      id: gallery.id,
      title: gallery.title,
      description: gallery.description,
    };
  }
}
