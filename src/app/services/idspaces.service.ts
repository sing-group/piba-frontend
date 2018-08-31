import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { IdSpace } from '../models/IdSpace';
import { IdSpaceInfo } from './entities/IdSpaceInfo';

@Injectable()
export class IdSpacesService {

  constructor(private http: HttpClient) { }

  getIdSpaces(): Observable<IdSpace[]> {
    return this.http.get<IdSpaceInfo[]>(`${environment.restApi}/idspace/`)
      .map(idSpaces => idSpaces.map(this.mapIdSpaceInfo.bind(this)));
  }

  getIdSpace(id: String): Observable<IdSpace> {
    return this.http.get<IdSpaceInfo>(`${environment.restApi}/idspace/${id}`).map(this.mapIdSpaceInfo.bind(this));
  }

  private mapIdSpaceInfo(idSpaceInfo: IdSpaceInfo): IdSpace {
    return {
      id: idSpaceInfo.id,
      name: idSpaceInfo.name
    };
  }

}
