import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import Exploration from '../models/Exploration';
import Video from '../models/Video';
import ExplorationInfo from './entities/ExplorationInfo';
import { environment } from '../../environments/environment';

import { forkJoin } from 'rxjs/observable/forkJoin';
import { concatMap } from 'rxjs/operators';
import { VideosService } from './videos.service';

@Injectable()
export class ExplorationsService {

  constructor(
    private http: HttpClient,
    private videosService: VideosService
  ) { }

  getExploration(uuid: string): Observable<Exploration> {
    return this.http.get<ExplorationInfo>(`${environment.restApi}/exploration/${uuid}`).pipe(
      concatMap((explorationInfo) => forkJoin(
        explorationInfo.videos.map(
          idAndUri => this.videosService.getVideo(idAndUri.id)
        )
      ), (explorationInfo, videos) => this.mapExplorationInfo(explorationInfo, videos))
    );
  }

  private mapExplorationInfo(explorationInfo: ExplorationInfo, videos: Video[]): Exploration {

    return {
      id: explorationInfo.id,
      date: explorationInfo.date,
      location: explorationInfo.location,
      videos: videos
    };
  }
}