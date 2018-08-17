import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import 'rxjs/add/operator/map';

import Video from '../models/Video';
import VideoInfo from './entities/VideoInfo';
import VideoUploadInfo from './entities/VideoUploadInfo';
import { environment } from '../../environments/environment';

@Injectable()
export class VideosService {

  constructor(private http: HttpClient) { }

  getVideos(): Observable<Video[]> {
      return this.http.get<VideoInfo[]>(`${environment.restApi}/video`)
      .map(videoInfos => videoInfos.map(this.mapVideoInfo))
  }

  getVideo(uuid: string, pollingInterval?: number): Observable<Video> {
    let videoRequest: Observable<Video> = this.http.get<VideoInfo>(`${environment.restApi}/video/${uuid}`).map(this.mapVideoInfo);
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
    formData.append("exploration_id", video.exploration_id)
    return this.http.post<VideoInfo>(`${environment.restApi}/video`, formData).map(this.mapVideoInfo);
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
      exploration_id: videoInfo.exploration_id
    };
  }
}
