import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Gallery} from '../models/Gallery';
import {environment} from '../../environments/environment';
import {concatMap, map} from 'rxjs/operators';
import {GalleryInfo} from './entities/GalleryInfo';
import {Image} from '../models/Image';
import {forkJoin, Observable, of} from 'rxjs';
import {ImagesService} from './images.service';

@Injectable({
  providedIn: 'root'
})
export class GalleriesService {

  constructor(private http: HttpClient,
              private imagesService: ImagesService) {
  }

  getGallery(id: string): Observable<Gallery> {
    return this.http.get<GalleryInfo>(`${environment.restApi}/gallery/${id}`)
      .pipe(
        concatMap(
          galleryInfo => forkJoin(
            galleryInfo.images.length === 0 ? of([]) :
              forkJoin(
                galleryInfo.images.map(
                  idAndUri => this.imagesService.getImage(idAndUri.id)
                ))
          ).pipe(
            map(
              images =>
                this.mapGalleryInfo(galleryInfo, images[0])
            )
          )
        )
      );
  }

  private mapGalleryInfo(galleryInfo: GalleryInfo, images: Image[]): Gallery {
    return {
      id: galleryInfo.id,
      title: galleryInfo.title,
      description: galleryInfo.description,
      images: images
    };
  }
}
