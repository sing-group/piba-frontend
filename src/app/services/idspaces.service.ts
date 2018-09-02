import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {IdSpace} from '../models/IdSpace';
import {IdSpaceInfo} from './entities/IdSpaceInfo';
import {map} from 'rxjs/operators';

@Injectable()
export class IdSpacesService {

  constructor(private http: HttpClient) { }

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

  private mapIdSpaceInfo(idSpaceInfo: IdSpaceInfo): IdSpace {
    return {
      id: idSpaceInfo.id,
      name: idSpaceInfo.name
    };
  }

}
