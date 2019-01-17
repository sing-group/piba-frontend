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

  private mapGalleryInfo(galleryInfo: GalleryInfo, images: Image[]): Gallery {
    return {
      id: galleryInfo.id,
      title: galleryInfo.title,
      description: galleryInfo.description,
    };
  }
}
