import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import Polyp from '../models/Polyp';
import Video from '../models/Video';
import VideoInfo from './entities/VideoInfo';
import { environment } from '../../environments/environment';

@Injectable()
export class VideosService {

  constructor(private http: HttpClient) { }

  getVideos(): Observable<Video[]> {
    return this.http.get<VideoInfo[]>(`${environment.restApi}/video`)
      .map(videoInfos => videoInfos.map(this.mapVideoInfo));
  }

  getVideo(uuid: string): Observable<Video> {
    return this.http.get<VideoInfo>(`${environment.restApi}/video/${uuid}`)
      .map(this.mapVideoInfo);
  }

  addPolyp(uuid: string, polyp: Polyp): Observable<Video> {
    return this.getVideo(uuid)
      .map(video => {
        video.polyps.push(polyp);
        return video;
      });
  }

  private mapVideoInfo(videoInfo: VideoInfo): Video {
    return {
      id: videoInfo.id,
      title: videoInfo.title,
      observation: videoInfo.observations,
      sources: videoInfo.video_sources.map(source => ({
        mediaType: source.type,
        url: source.src
      })),
      polyps: []
    };
  }
}
