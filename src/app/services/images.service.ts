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
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Image} from '../models/Image';
import {forkJoin, Observable, of, throwError} from 'rxjs';
import {ImageInfo} from './entities/ImageInfo';
import {catchError, concatMap, map} from 'rxjs/operators';
import {Video} from '../models/Video';
import {IdAndUri} from './entities/IdAndUri';
import {VideosService} from './videos.service';
import {PolypLocation} from '../models/PolypLocation';
import {PolypLocationInfo} from './entities/PolypLocationInfo';
import {Gallery} from '../models/Gallery';
import {ImagePage} from './entities/ImagePage';
import {ImageUploadInfo} from './entities/ImageUploadInfo';
import {PolypsService} from './polyps.service';
import {Polyp} from '../models/Polyp';
import {ImagesInGalleryInfo} from './entities/ImagesInGalleryInfo';
import {ImageFilter} from '../models/ImageFilter';
import {PibaError} from '../modules/notification/entities';
import {iif} from 'rxjs/internal/observable/iif';
import {defer} from 'rxjs/internal/observable/defer';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {

  constructor(private http: HttpClient,
              private videosService: VideosService,
              private polypsService: PolypsService) {
  }

  private static mapImageInfo(imageInfo: ImageInfo, video: Video, polypLocation: PolypLocation, polyp: Polyp): Image {
    return {
      id: imageInfo.id,
      numFrame: imageInfo.numFrame,
      isRemoved: imageInfo.isRemoved,
      base64contents: imageInfo.base64contents,
      video: video,
      gallery: null,
      polyp: polyp,
      polypLocation: polypLocation,
      observation: imageInfo.observation,
      manuallySelected: imageInfo.manuallySelected
    };
  }

  private static mapBasicImageInfo(imageInfo: ImageInfo): Image {
    return {
      id: imageInfo.id,
      numFrame: imageInfo.numFrame,
      isRemoved: imageInfo.isRemoved,
      base64contents: imageInfo.base64contents,
      video: null,
      gallery: null,
      polyp: null,
      polypLocation: null,
      observation: imageInfo.observation,
      manuallySelected: imageInfo.manuallySelected
    };
  }

  private static mapPolypLocationInfo(polypLocationInfo: PolypLocationInfo): PolypLocation {
    return new PolypLocation(
      polypLocationInfo.x,
      polypLocationInfo.y,
      polypLocationInfo.width,
      polypLocationInfo.height
    );
  }

  private static arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  getImage(id: string): Observable<Image> {
    return this.http.get<ImageInfo>(`${environment.restApi}/image/${id}/metadata`).pipe(
      concatMap(imageInfo => {
          return forkJoin(
            this.videosService.getVideo((<IdAndUri>imageInfo.video).id),
            this.getLocation(imageInfo.id).pipe(catchError(err => err.status === 400 ? of(null) : throwError(err))),
            this.getImageContents(imageInfo.id),
            iif(() => Boolean(imageInfo.polyp), defer(() => this.polypsService.getPolyp((<IdAndUri>imageInfo.polyp).id)), of(null))
          ).pipe(
            map(
              videoAndLocationAndImageContent => {
                imageInfo.base64contents = videoAndLocationAndImageContent[2];
                return ImagesService.mapImageInfo(imageInfo, videoAndLocationAndImageContent[0], videoAndLocationAndImageContent[1],
                  videoAndLocationAndImageContent[3]);
              })
          );
        }
      )
    );
  }

  getImageContents(id: string): Observable<string> {
    return this.http.get(`${environment.restApi}/image/${id}`, { responseType: 'arraybuffer' })
      .pipe(map(ImagesService.arrayBufferToBase64));
  }

  uploadImage(image: ImageUploadInfo): Observable<Image> {
    const formData: FormData = new FormData();
    formData.append('image', image.image);
    formData.append('gallery', image.gallery);
    formData.append('video', image.video);
    if (image.polyp !== null) {
      formData.append('polyp', image.polyp);
    }
    formData.append('numFrame', image.numFrame.toString());
    if (image.observation !== null) {
      formData.append('observation', image.observation);
    }
    formData.append('manuallySelected', image.manuallySelected.toString());

    return this.http.post<ImageInfo>(`${environment.restApi}/image`, formData)
      .pipe(map(ImagesService.mapBasicImageInfo));
  }

  createLocation(imageId: string, polypLocation: PolypLocation): Observable<PolypLocation> {
    return this.http.post<PolypLocationInfo>(`${environment.restApi}/image/${imageId}/polyplocation`, polypLocation)
      .pipe(
        map(ImagesService.mapPolypLocationInfo),
        PibaError.throwOnError(
          'Error creating location',
          `Location (x: ${polypLocation.x}, y: ${polypLocation.y}, width: ${polypLocation.width}, height: ${polypLocation.height}) ` +
          `could not be created in image '${imageId}'.`
        )
      );
  }

  getLocation(id: string): Observable<PolypLocation> {
    return this.http.get<PolypLocationInfo>(`${environment.restApi}/image/${id}/polyplocation`).pipe(
      map(ImagesService.mapPolypLocationInfo)
    );
  }

  delete(id: string, observationsToRemove: string): Observable<any> {
    console.log(observationsToRemove);
    const httpOptions = {
      headers: new HttpHeaders({'X-ReasonToRemove': observationsToRemove})
    };
    return this.http.delete(`${environment.restApi}/image/${id}`, httpOptions);
  }

  deleteLocation(imageId: string) {
    return this.http.delete(`${environment.restApi}/image/${imageId}/polyplocation`);
  }

  modifyLocation(imageId: string, location: PolypLocation): Observable<PolypLocation> {
    return this.http.put<PolypLocationInfo>(`${environment.restApi}/image/${imageId}/polyplocation`, location)
      .pipe(
        map(ImagesService.mapPolypLocationInfo),
        PibaError.throwOnError(
          'Error modifying location',
          `Location of image ${imageId} could not be modified.`
        )
      );
  }

  getImagesByGallery(gallery: Gallery, page: number, pageSize: number, filter: ImageFilter = ImageFilter.ALL): Observable<ImagePage> {
    const withLocation = filter !== ImageFilter.WITHOUT_LOCATION;
    return this.http.get<ImageInfo[]>
    (`${environment.restApi}/image?galleryId=${gallery.id}&page=${page}&pageSize=${pageSize}&filter=${ImageFilter[filter]}`,
      {observe: 'response'})
      .pipe(
        concatMap(response =>
          iif(() => response.body.length === 0,
            defer(() => of({
              totalItems: Number(response.headers.get('X-Pagination-Total-Items')),
              images: []
            })),
            this.videoAndImagesContentsAndGalleryAndOptionalLocation(of(response.body), gallery, withLocation).pipe(
              map(images => ({
                totalItems: Number(response.headers.get('X-Pagination-Total-Items')),
                images: images
              }))
            )
          )
        )
      );
  }

  getImagesIdentifiersByGallery(gallery: Gallery, filter: ImageFilter = ImageFilter.ALL): Observable<ImagesInGalleryInfo> {
    return this.http.get<IdAndUri[]>(
      `${environment.restApi}/image/id?galleryId=${gallery.id}&filter=${filter}`,
      {observe: 'response'}
    )
      .pipe(
        concatMap(response => {
          const ids = [];
          response.body.forEach(idAndUri => {
            ids.push(idAndUri.id);
          });
          return of({
            totalItems: Number(response.headers.get('X-Pagination-Total-Items')),
            imagesId: ids
          });
        })
      );
  }

  listImagesByPolyp(polyp: Polyp, filter: ImageFilter = ImageFilter.ALL): Observable<Image[]> {
    return this.http.get<ImageInfo[]>(
      `${environment.restApi}/image?polypId=${polyp.id}&filter=${ImageFilter[filter]}`
    )
      .pipe(
        map(images => images.map(ImagesService.mapBasicImageInfo)),
        PibaError.throwOnError(
          'Error listing images',
          `Images of polyp ${polyp.name} could not be retrieved.`
        )
      );
  }

  listImagesByPolypAndGallery(polyp: Polyp, gallery: Gallery, filter: ImageFilter = ImageFilter.ALL): Observable<Image[]> {
    return this.http.get<ImageInfo[]>(
      `${environment.restApi}/image?polypId=${polyp.id}&galleryId=${gallery.id}&filter=${ImageFilter[filter]}`
    )
      .pipe(
        map(images => images.map(ImagesService.mapBasicImageInfo)),
        PibaError.throwOnError(
          'Error listing images',
          `Images of polyp ${polyp.name} could not be retrieved.`
        )
      );
  }

  searchObservations(observationToRemoveStartsWith?: string): Observable<string[]> {
    let options: {params?: HttpParams};
    if (Boolean(observationToRemoveStartsWith)) {
      options = {
        params: new HttpParams()
          .append('observationStartsWith', observationToRemoveStartsWith)
      };
    }

    return this.http.get<string[]>(`${environment.restApi}/image/observations`, options);
  }

  private videoAndImagesContentsAndGalleryAndOptionalLocation(
    imageInfoObservable: Observable<ImageInfo[]>,
    gallery: Gallery,
    withLocation: boolean
  ): Observable<Image[]> {
    return imageInfoObservable.pipe(
      concatMap(imageInfos =>
        forkJoin(
          forkJoin(imageInfos.map(imageInfo => this.videosService.getVideo((<IdAndUri>imageInfo.video).id))),
          forkJoin(imageInfos.map(imageInfo => (<IdAndUri>imageInfo.polyp) !== null ?
            this.polypsService.getPolyp((<IdAndUri>imageInfo.polyp).id) : of(null))),
          forkJoin(imageInfos.map(imageInfo => withLocation ? this.getLocation(imageInfo.id)
            .pipe(catchError((err) => err.status === 400 ? of(null) : throwError(err))) : of(null))),
          forkJoin(imageInfos.map(imageInfo => this.getImageContents(imageInfo.id)))
        ).pipe(
          map(videosAndLocationsAndImageContents =>
            imageInfos.map((imageInfo, index) => {
                imageInfo.base64contents = videosAndLocationsAndImageContents[3][index];
                const image: Image = ImagesService.mapImageInfo(
                  imageInfo,
                  videosAndLocationsAndImageContents[0][index],
                  videosAndLocationsAndImageContents[2][index],
                  videosAndLocationsAndImageContents[1][index]
                );
                image.gallery = gallery;
                return image;
              }
            )
          )
        )
      )
    );
  }
}
