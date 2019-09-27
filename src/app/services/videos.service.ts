import {Injectable} from '@angular/core';
import {HttpClient, HttpEventType} from '@angular/common/http';
import {Observable} from 'rxjs';

import {Video} from '../models/Video';
import {VideoInfo} from './entities/VideoInfo';
import {VideoUploadInfo} from './entities/VideoUploadInfo';
import {environment} from '../../environments/environment';
import {IdAndUri} from './entities/IdAndUri';
import {interval} from 'rxjs/internal/observable/interval';
import {filter, map, switchMap} from 'rxjs/operators';

@Injectable()
export class VideosService {

  constructor(private http: HttpClient) {
  }

  getVideos(): Observable<Video[]> {
    return this.http.get<VideoInfo[]>(`${environment.restApi}/video`)
      .pipe(
        map(videoInfos => videoInfos.map(this.mapVideoInfo))
      );
  }

  getVideo(uuid: string, pollingInterval?: number): Observable<Video> {
    const videoRequest: Observable<Video> =
      this.http.get<VideoInfo>(`${environment.restApi}/video/${uuid}`)
        .pipe(
          map(this.mapVideoInfo)
        );

    if (pollingInterval > 0) {
      return interval(pollingInterval).pipe(
        switchMap(() => videoRequest)
      );
    } else {
      return videoRequest;
    }
  }

  createVideo(video: VideoUploadInfo,
              onStart: () => void,
              onProgress: (loaded: number, total: number) => void,
              onFinish: () => void): Observable<Video> {

    const formData: FormData = new FormData();
    formData.append('title', video.title);
    formData.append('observations', video.observations);
    formData.append('video', video.file);
    formData.append('withText', video.withText);
    formData.append('exploration_id', video.exploration);

    return this.http.post<VideoInfo>(`${environment.restApi}/video`, formData, {observe: 'events', reportProgress: true})
      .pipe(
        map(event => {
          switch (event.type) {
            case HttpEventType.Sent:
              onStart();
              break;
            case HttpEventType.UploadProgress:
              onProgress(event.loaded, event.total);
              break;
          }
          return event;
        })
      )
      .pipe(
        filter(event => event.type === HttpEventType.Response))
      .pipe(
        map(event => {
            onFinish();
            if (event.type === HttpEventType.Response) {
              return this.mapVideoInfo(event.body);
            }
          }
        )
      );
  }

  delete(id: string) {
    return this.http.delete(`${environment.restApi}/video/` + id);
  }

  editVideo(video: Video): Observable<Video> {
    const videoInfo: VideoInfo = this.toVideoInfo(video);

    return this.http.put<VideoInfo>(`${environment.restApi}/video/${videoInfo.id}`, videoInfo)
      .pipe(
        map(this.mapVideoInfo)
      );
  }

  private mapVideoInfo(videoInfo: VideoInfo): Video {
    return {
      id: videoInfo.id,
      title: videoInfo.title,
      observations: videoInfo.observations,
      sources: videoInfo.video_sources.map(source => ({
        mediaType: source.type,
        url: source.src
      })),
      polypRecording: [],
      modifications: [],
      isProcessing: videoInfo.processing,
      withText: videoInfo.withText,
      fps: videoInfo.fps,
      exploration: (<IdAndUri>videoInfo.exploration).id
    };
  }

  private toVideoInfo(video: Video): VideoInfo {
    return {
      id: video.id,
      title: video.title,
      observations: video.observations,
      video_sources: video.sources.map(source => ({
        type: source.mediaType,
        src: source.url
      })),
      processing: video.isProcessing,
      withText: video.withText,
      fps: video.fps,
      exploration: video.exploration
    };
  }
}
