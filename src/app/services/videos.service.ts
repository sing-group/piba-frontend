import { Injectable } from '@angular/core';

import {Observable} from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/map';

import { Polyp } from '../models/polyp';
import { Video } from '../models/video';
import { VIDEOS } from './mock-videos';

@Injectable()
export class VideosService {

  constructor() { }

  getVideos(): Observable<Video[]> {
    return of(VIDEOS);
  }

  getVideo(uuid: string): Observable<Video> {
    return of(VIDEOS.find(video => video.id === uuid));
  }

  addPolyp(uuid: string, polyp: Polyp): Observable<Video> {
    return this.getVideo(uuid)
      .map(video => {
        video.polyps.push(polyp);
        return video;
      });
  }
}
