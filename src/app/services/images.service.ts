import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Image} from '../models/Image';
import {Observable} from 'rxjs';
import {ImageInfo} from './entities/ImageInfo';
import {concatMap, map} from 'rxjs/operators';
import {Video} from '../models/Video';
import {IdAndUri} from './entities/IdAndUri';
import {VideosService} from './videos.service';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {

  constructor(private http: HttpClient,
              private videosService: VideosService) {
  }

  getImage(id: string): Observable<Image> {
    return this.http.get<ImageInfo>(`${environment.restApi}/image/${id}/metadata`)
      .pipe(
        concatMap(imageInfo =>
          this.getImageContents(imageInfo.id).pipe(
            map(base64contents => {
              imageInfo.base64contents = base64contents;
              return imageInfo;
            })
          )
        )
      )
      .pipe(
        concatMap(imageInfo =>
          this.videosService.getVideo((<IdAndUri> imageInfo.video).id).pipe(
            map(video =>
              this.mapImageInfo(imageInfo, video)
            )
          )
        )
      );
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

  private mapImageInfo(imageInfo: ImageInfo, video: Video): Image {
    return {
      id: imageInfo.id,
      numFrame: imageInfo.numFrame,
      isRemoved: imageInfo.isRemoved,
      base64contents: imageInfo.base64contents,
      video: video,
      gallery: null
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
