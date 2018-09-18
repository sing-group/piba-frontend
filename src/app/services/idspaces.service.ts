import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {IdSpace} from '../models/IdSpace';
import {IdSpaceInfo} from './entities/IdSpaceInfo';
import {map} from 'rxjs/operators';
import ExplorationInfo from './entities/ExplorationInfo';
import {PibaError} from '../modules/notification/entities';

@Injectable()
export class IdSpacesService {

  constructor(private http: HttpClient) {
  }

  getIdSpaces(): Observable<IdSpace[]> {
    return this.http.get<IdSpaceInfo[]>(`${environment.restApi}/idspace/`)
      .pipe(
        map(idSpaces => idSpaces.map(this.mapIdSpaceInfo.bind(this)))
      );
  }

  getIdSpace(id: String): Observable<IdSpace> {
    return this.http.get<IdSpaceInfo>(`${environment.restApi}/idspace/${id}`)
      .pipe(
        map(this.mapIdSpaceInfo.bind(this))
      );
  }

  createIdSpace(idSpace: IdSpace): Observable<IdSpace> {
    const idSpaceInfo = this.toIdSpaceInfo(idSpace);
    return this.http.post<IdSpaceInfo>(`${environment.restApi}/idspace`, idSpaceInfo)
      .pipe(
        map(this.mapIdSpaceInfo.bind(this))
      );
  }

  editIdSpace(idSpace: IdSpace): Observable<IdSpace> {
    const idSpaceInfo = this.toIdSpaceInfo(idSpace);
    return this.http.put<IdSpaceInfo>(`${environment.restApi}/idspace`, idSpaceInfo)
      .pipe(
        map(this.mapIdSpaceInfo.bind(this))
      );
  }

  delete(id: string) {
    return this.http.delete(`${environment.restApi}/idspace/${id}`).pipe(
      PibaError.throwOnError('Not removed space', 'The space with id ' + id + ' could not be removed.')
    );
  }

  private mapIdSpaceInfo(idSpaceInfo: IdSpaceInfo): IdSpace {
    return {
      id: idSpaceInfo.id,
      name: idSpaceInfo.name
    };
  }

  private toIdSpaceInfo(idSpace: IdSpace): IdSpaceInfo {
    return {
      id: idSpace.id,
      name: idSpace.name
    };
  }

}
