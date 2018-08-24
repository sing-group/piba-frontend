import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import 'rxjs/add/operator/map';

import Video from '../models/Video';
import VideoInfo from './entities/VideoInfo';
import VideoUploadInfo from './entities/VideoUploadInfo';
import { environment } from '../../environments/environment';
import IdAndUri from './entities/IdAndUri';

@Injectable()
export class VideosService {

  constructor(private http: HttpClient) { }

  getVideos(): Observable<Video[]> {
    return this.http.get<VideoInfo[]>(`${environment.restApi}/video`)
      .map(videoInfos => videoInfos.map(this.mapVideoInfo))
  }

  getVideo(uuid: string, pollingInterval?: number): Observable<Video> {
    let videoRequest: Observable<Video> =
      this.http.get<VideoInfo>(`${environment.restApi}/video/${uuid}`)
        .map(this.mapVideoInfo);

    if (pollingInterval > 0) {
      return Observable.interval(pollingInterval).switchMap(() => videoRequest);
    } else {
      return videoRequest;
    }
  }

  createVideo(video: VideoUploadInfo): Observable<Video> {
    let formData: FormData = new FormData();
    formData.append("title", video.title);
    formData.append("observations", video.observations);
    formData.append("video", video.file);
    formData.append("exploration_id", video.exploration)
    return this.http.post<VideoInfo>(`${environment.restApi}/video`, formData).map(this.mapVideoInfo);
  }

  delete(id: string) {
    return this.http.delete(`${environment.restApi}/video/` + id);
  }

  editVideo(video: Video): Observable<Video> {
    let videoInfo: VideoInfo = this.toVideoInfo(video);

    return this.http.put<VideoInfo>(`${environment.restApi}/video`, videoInfo).map(this.mapVideoInfo);
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
      isProcessing: videoInfo.processing,
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
      exploration: video.exploration
    }
  }
}
