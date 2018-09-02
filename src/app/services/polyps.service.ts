import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import Polyp, {LST, NICE, PARIS, WASP} from '../models/Polyp';
import {environment} from '../../environments/environment';
import PolypInfo from './entities/PolypInfo';
import {EnumUtils} from '../utils/enum.utils';
import {map} from 'rxjs/operators';

@Injectable()
export class PolypsService {

  constructor(private http: HttpClient) {
  }

  createPolyp(polyp: Polyp): Observable<Polyp> {
    const polypInfo: PolypInfo = this.toPolypInfo(polyp);

    return this.http.post<PolypInfo>(`${environment.restApi}/polyp`, polypInfo)
      .pipe(
        map(this.mapPolypInfo.bind(this))
      );
  }

  getPolyp(uuid: string): Observable<Polyp> {
    return this.http.get<PolypInfo>(`${environment.restApi}/polyp/${uuid}`)
      .pipe(
        map(this.mapPolypInfo)
      );
  }

  editPolyp(polyp: Polyp): Observable<Polyp> {
    const polypInfo: PolypInfo = this.toPolypInfo(polyp);

    return this.http.put<PolypInfo>(`${environment.restApi}/polyp/`, polypInfo)
      .pipe(
        map(this.mapPolypInfo)
      );
  }

  getPolypsOfExploration(exploration_id: string): Observable<Polyp[]> {
    return this.http.get<Polyp[]>(`${environment.restApi}/exploration/${exploration_id}/polyps`)
      .pipe(
        map(polypsInfo => polypsInfo.map(this.mapPolypInfo.bind(this)))
      );
  }

  delete(uuid: string) {
    return this.http.delete((`${environment.restApi}/polyp/` + uuid));
  }

  private mapPolypInfo(polypInfo: PolypInfo): Polyp {
    return {
      id: polypInfo.id,
      name: polypInfo.name,
      size: polypInfo.size,
      location: polypInfo.location,
      wasp: WASP[polypInfo.wasp],
      nice: NICE[polypInfo.nice],
      lst: LST[polypInfo.lst],
      paris: PARIS[polypInfo.paris],
      histology: polypInfo.histology,
      videos: [],
      exploration: null
    };
  }

  private toPolypInfo(polyp: Polyp): PolypInfo {
    const enumUtils = new EnumUtils;
    return {
      id: polyp.id,
      name: polyp.name,
      size: polyp.size,
      location: polyp.location,
      wasp: enumUtils.findKeyForValue(WASP, polyp.wasp),
      nice: enumUtils.findKeyForValue(NICE, polyp.nice),
      lst: enumUtils.findKeyForValue(LST, polyp.lst),
      paris: enumUtils.findKeyForValue(PARIS, polyp.paris),
      histology: polyp.histology,
      exploration: polyp.exploration.id
    };
  }
}
