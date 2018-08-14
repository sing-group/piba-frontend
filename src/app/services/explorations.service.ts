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
import Polyp from '../models/Polyp';
import { PolypsService } from './polyps.service';

@Injectable()
export class ExplorationsService {

  constructor(
    private http: HttpClient,
    private videosService: VideosService,
    private polypsService: PolypsService
  ) { }

  getExploration(uuid: string): Observable<Exploration> {
    return this.http.get<ExplorationInfo>(`${environment.restApi}/exploration/${uuid}`).pipe(
      concatMap((explorationInfo) => {
        return forkJoin(
          explorationInfo.videos.length == 0 ? Observable.of([]) :
            forkJoin(

              explorationInfo.videos.map(
                idAndUri => this.videosService.getVideo(idAndUri.id)
              )),
          explorationInfo.polyps.length == 0 ? Observable.of([]) :
            forkJoin(
              explorationInfo.polyps.map(
                idAndUri => this.polypsService.getPolyp(idAndUri.id)
              )
            )
        )
      }, (explorationInfo, videosAndPolyps) => {
        return this.mapExplorationInfo(explorationInfo, videosAndPolyps[0], videosAndPolyps[1]);
      }
      )
    );
  }

  getExplorations(): Observable<Exploration[]> {
    return this.http.get<ExplorationInfo[]>(`${environment.restApi}/exploration/`)
      .map(explorationsInfo => explorationsInfo.map(this.mapOnlyExplorationInfo.bind(this)));
  }

  private mapExplorationInfo(explorationInfo: ExplorationInfo, videos: Video[], polyps: Polyp[]): Exploration {
    return {
      id: explorationInfo.id,
      date: explorationInfo.date,
      location: explorationInfo.location,
      videos: videos,
      polyps: polyps
    };
  }

  private mapOnlyExplorationInfo(explorationInfo: ExplorationInfo): Exploration {
    return this.mapExplorationInfo(explorationInfo, [], []);
  }

  private toExplorationInfo(exploration: Exploration): ExplorationInfo {
    return {
      id: exploration.id,
      date: exploration.date,
      location: exploration.location
    }
  }
  createExploration(exploration: Exploration): Observable<Exploration> {
    let explorationInfo = this.toExplorationInfo(exploration);
    return this.http.post<ExplorationInfo>(`${environment.restApi}/exploration`, explorationInfo).map(this.mapOnlyExplorationInfo.bind(this));
  }

  editExploration(exploration: Exploration): Observable<Exploration> {
    let explorationInfo = this.toExplorationInfo(exploration);
    return this.http.put<ExplorationInfo>(`${environment.restApi}/exploration`, explorationInfo).map(this.mapOnlyExplorationInfo.bind(this));
  }

}
