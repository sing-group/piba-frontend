import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
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

@Injectable({
  providedIn: 'root'
})
export class ImagesService {

  constructor(private http: HttpClient,
              private videosService: VideosService) {
  }

  getImageContents(id: string): Observable<string> {
    return this.http.get(`${environment.restApi}/image/${id}`, {
      responseType:
        'arraybuffer'
    })
      .pipe(map((response) => {
        return this.arrayBufferToBase64(response);
      }));
  }

  createLocation(id: string, polypLocation: PolypLocation): Observable<PolypLocation> {
    return this.http.post<PolypLocationInfo>(`${environment.restApi}/image/${id}/polyplocation`, polypLocation).pipe(
      map(
        this.maptoPolypLocationInfo.bind(this))
    );
  }

  getLocation(id: string): Observable<PolypLocation> {
    return this.http.get<PolypLocationInfo>(`${environment.restApi}/image/${id}/polyplocation`).pipe(
      map(
        this.maptoPolypLocationInfo.bind(this))
    );
  }

  delete(id: string, observationsToRemove: string) {
    const httpOptions = {
      headers: new HttpHeaders({'X-ReasonToRemove': observationsToRemove})
    };
    return this.http.delete(`${environment.restApi}/image/${id}`, httpOptions);
  }

  deleteLocation(id: string) {
    return this.http.delete(`${environment.restApi}/image/${id}/polyplocation`);
  }

  getImagesByGallery(gallery: Gallery, page: number, pageSize: number): Observable<ImagePage> {
    return this.http.get<ImageInfo[]>(`${environment.restApi}/image/gallery/${gallery.id}?page=${page}&pageSize=${pageSize}`,
      {observe: 'response'})
      .pipe(
        concatMap(response => {
            return this.videoAndLocationAndImagesContentsAndGallery(of(response.body), gallery).pipe(
              map(images => {
                  return {
                    totalItems: Number(response.headers.get('X-Pagination-Total-Items')),
                    images: images
                  };
                }
              ));
          }
        )
      );
  }

  private videoAndLocationAndImagesContentsAndGallery(imageInfoObservable: Observable<ImageInfo[]>,
                                                      gallery: Gallery): Observable<Image[]> {
    return imageInfoObservable.pipe(
      concatMap(imageInfos =>
        forkJoin(
          forkJoin(imageInfos.map(imageInfo => this.videosService.getVideo((<IdAndUri>imageInfo.video).id))),
          forkJoin(imageInfos.map(imageInfo => this.getLocation(imageInfo.id)
            .pipe(catchError((err) => err.status === 400 ? of(null) : throwError(err))))),
          forkJoin(imageInfos.map(imageInfo => this.getImageContents(imageInfo.id)))
        ).pipe(
          map(videosAndLocationsAndImageContents =>
            imageInfos.map((imageInfo, index) => {
                imageInfo.base64contents = videosAndLocationsAndImageContents[2][index];
                const image: Image = this.mapImageInfo(
                  imageInfo, videosAndLocationsAndImageContents[0][index], videosAndLocationsAndImageContents[1][index]);
                image.gallery = gallery;
                return image;
              }
            )
          )
        )
      )
    );
  }

  private mapImageInfo(imageInfo: ImageInfo, video: Video, polypLocation: PolypLocation): Image {
    return {
      id: imageInfo.id,
      numFrame: imageInfo.numFrame,
      isRemoved: imageInfo.isRemoved,
      base64contents: imageInfo.base64contents,
      video: video,
      gallery: null,
      polypLocation: polypLocation
    };
  }

  private maptoPolypLocationInfo(polypLocationInfo: PolypLocationInfo): PolypLocation {
    return {
      x: polypLocationInfo.x,
      y: polypLocationInfo.y,
      width: polypLocationInfo.width,
      height: polypLocationInfo.height
    };
  }

  private arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

}
