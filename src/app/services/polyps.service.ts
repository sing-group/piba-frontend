import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import Polyp, { WASP, NICE, LST, PARIS } from '../models/Polyp';
import { environment } from '../../environments/environment';
import PolypInfo from './entities/PolypInfo';

@Injectable()
export class PolypsService {

  constructor(private http: HttpClient) { }

  getPolyps(): Observable<Polyp[]> {
    return this.http.get<PolypInfo[]>(`${environment.restApi}/polyp`).map(polypInfo => polypInfo.map(this.mapPolypInfo));
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
      videos: []
    };
  }
}
