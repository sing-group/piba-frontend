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
import {concatMap, map} from 'rxjs/operators';
import {GalleryInfo} from './entities/GalleryInfo';
import {Observable} from 'rxjs';
import {GalleryEditionInfo} from './entities/GalleryEditionInfo';
import {GalleryStats} from '../models/GalleryStats';
import {GalleryStatsInfo} from './entities/GalleryStatsInfo';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';
import {OperatorFunction} from 'rxjs/internal/types';

@Injectable({
  providedIn: 'root'
})
export class GalleriesService {
  private static mapGalleryInfo(galleryInfo: GalleryInfo, galleryStats?: GalleryStatsInfo): Gallery {
    const gallery: Gallery = {
      id: galleryInfo.id,
      title: galleryInfo.title,
      description: galleryInfo.description,
      creationDate: new Date(galleryInfo.creationDate)
    };

    if (Boolean(galleryStats)) {
      gallery.stats = GalleriesService.mapGalleryStatsInfo(galleryStats);
    }

    return gallery;
  }

  private static toGalleryEditionInfo(gallery: Gallery): GalleryEditionInfo {
    return {
      id: gallery.id,
      title: gallery.title,
      description: gallery.description
    };
  }

  private static mapGalleryStatsInfo(galleryStatsInfo: GalleryStatsInfo): GalleryStats {
    return {
      countImages: galleryStatsInfo.countImages,
      countImagesWithPolyp: galleryStatsInfo.countImagesWithPolyp,
      countImagesWithoutLocation: galleryStatsInfo.countImagesWithoutLocation,
      countImagesWithLocation: galleryStatsInfo.countImagesWithLocation,
      countImagesWithPolypAndWithoutLocation: galleryStatsInfo.countImagesWithPolypAndWithoutLocation,
      countImagesWithPolypAndLocation: galleryStatsInfo.countImagesWithPolypAndLocation
    };
  }

  constructor(private http: HttpClient) {
  }

  listGalleries(): Observable<Gallery[]> {
    return this.http.get<GalleryInfo[]>(`${environment.restApi}/gallery/`)
      .pipe(
        concatMap(galleryInfos =>
          forkJoin(galleryInfos.map((gallery, index) => this.getGalleryStats(gallery.id)
            .pipe(
              map(stats => GalleriesService.mapGalleryInfo(galleryInfos[index], stats))
            )
          ))
        )
      );
  }

  getGallery(id: string): Observable<Gallery> {
    return this.http.get<GalleryInfo>(`${environment.restApi}/gallery/${id}`)
      .pipe(this.retrieveStatsAndMap());
  }

  createGallery(gallery: Gallery): Observable<Gallery> {
    const galleryInfo = GalleriesService.toGalleryEditionInfo(gallery);
    return this.http.post<GalleryInfo>(`${environment.restApi}/gallery`, galleryInfo)
      .pipe(this.retrieveStatsAndMap());
  }

  editGallery(gallery: Gallery): Observable<Gallery> {
    const galleryInfo = GalleriesService.toGalleryEditionInfo(gallery);
    return this.http.put<GalleryInfo>(`${environment.restApi}/gallery/${galleryInfo.id}`, galleryInfo)
      .pipe(this.retrieveStatsAndMap());
  }

  private getGalleryStats(id: string): Observable<GalleryStatsInfo> {
    return this.http.get<GalleryStatsInfo>(`${environment.restApi}/gallery/${id}/stats`);
  }

  private retrieveStatsAndMap(): OperatorFunction<GalleryInfo, Gallery> {
    return concatMap(galleryInfo => this.getGalleryStats(galleryInfo.id)
      .pipe(
        map(stats => GalleriesService.mapGalleryInfo(galleryInfo, stats))
      )
    );
  }
}
