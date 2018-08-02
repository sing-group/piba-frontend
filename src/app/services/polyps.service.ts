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
      exploration: polypInfo.exploration
    };
  }

  createPolyp(polyp:Polyp):Observable<Polyp>{
    return this.http.post<PolypInfo>(`${environment.restApi}/polyp`, polyp).map(this.mapPolypInfo.bind(this));
  }

  getPolyp(uuid: string): Observable<Polyp> {

    return this.http.get<PolypInfo>(`${environment.restApi}/polyp/${uuid}`).map(this.mapPolypInfo);
  }
}
