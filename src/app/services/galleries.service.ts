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
