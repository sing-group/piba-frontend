import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import Polyp, { WASP, NICE, LST, PARIS } from '../models/Polyp';
import { environment } from '../../environments/environment';
import PolypInfo from './entities/PolypInfo';

@Injectable()
export class PolypsService {

  constructor(private http: HttpClient) { }

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
    return {
      id: polyp.id,
      name: polyp.name,
      size: polyp.size,
      location: polyp.location,
      wasp: this.findKeyForValue(WASP, polyp.wasp),
      nice: this.findKeyForValue(NICE, polyp.nice),
      lst: this.findKeyForValue(LST, polyp.lst),
      paris: this.findKeyForValue(PARIS, polyp.paris),
      histology: polyp.histology,
      exploration: polyp.exploration.id
    }
  }

  private findKeyForValue(enumType: any, value: string): string {
    return this.enumKeys(enumType).find((key: string) => enumType[key] == value);
  }
  private enumKeys<T>(enumType: any): string[] {
    return <string[]>(<any>Object.keys(enumType));
  }
  createPolyp(polyp: Polyp): Observable<Polyp> {
    let polypInfo: PolypInfo = this.toPolypInfo(polyp);

    return this.http.post<PolypInfo>(`${environment.restApi}/polyp`, polypInfo).map(this.mapPolypInfo.bind(this));
  }

  getPolyp(uuid: string): Observable<Polyp> {
    return this.http.get<PolypInfo>(`${environment.restApi}/polyp/${uuid}`).map(this.mapPolypInfo);
  }

  editPolyp(polyp: Polyp): Observable<Polyp> {
    let polypInfo: PolypInfo = this.toPolypInfo(polyp);

    return this.http.put<PolypInfo>(`${environment.restApi}/polyp/`, polypInfo).map(this.mapPolypInfo);
  }

  getPolypsOfExploration(exploration_id: string): Observable<Polyp[]> {
    return this.http.get<Polyp[]>(`${environment.restApi}/exploration/${exploration_id}/polyps`).map(
      polypsInfo => polypsInfo.map(this.mapPolypInfo.bind(this)));
  }

  delete(uuid:string){
    return this.http.delete((`${environment.restApi}/polyp/` + uuid));
  }
}
