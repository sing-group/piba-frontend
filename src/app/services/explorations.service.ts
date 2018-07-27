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
      concatMap((explorationInfo) => {
        if (explorationInfo.videos.length <= 0) {
          return Observable.of([])
        }
        return forkJoin(
          explorationInfo.videos.map(
            idAndUri => this.videosService.getVideo(idAndUri.id)
          )
        )
      }, (explorationInfo, videos) => this.mapExplorationInfo(explorationInfo, videos))
    );
  }

  getExplorations(): Observable<Exploration[]> {
    return this.http.get<ExplorationInfo[]>(`${environment.restApi}/exploration/`)
      .map(explorationsInfo => explorationsInfo.map(this.mapOnlyExplorationInfo.bind(this)));
  }

  private mapExplorationInfo(explorationInfo: ExplorationInfo, videos: Video[]): Exploration {
    return {
      id: explorationInfo.id,
      date: explorationInfo.date,
      location: explorationInfo.location,
      videos: videos
    };
  }

  private mapOnlyExplorationInfo(explorationInfo: ExplorationInfo): Exploration {
    return this.mapExplorationInfo(explorationInfo, []);
  }

  createExploration(exploration: Exploration): Observable<Exploration> {
    return this.http.post<ExplorationInfo>(`${environment.restApi}/exploration`, exploration).map(this.mapOnlyExplorationInfo.bind(this));
  }

  editExploration(exploration: Exploration): Observable<Exploration> {
    return this.http.put<ExplorationInfo>(`${environment.restApi}/exploration`, exploration).map(this.mapOnlyExplorationInfo.bind(this));
  }

}
