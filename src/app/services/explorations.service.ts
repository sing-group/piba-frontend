import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import Exploration from '../models/Exploration';
import ExplorationInfo from './entities/ExplorationInfo';
import { environment } from '../../environments/environment';

@Injectable()
export class ExplorationsService {

  constructor(private http: HttpClient) { }

  getExploration(uuid: string): Observable<Exploration> {
    return this.http.get<ExplorationInfo>(`${environment.restApi}/exploration/${uuid}`)
      .map(this.mapExplorationInfo);
  }

  private mapExplorationInfo(explorationInfo: ExplorationInfo): Exploration {
    return {
      id: explorationInfo.id,
      date: explorationInfo.date,
      location:explorationInfo.location
    };
  }
}
