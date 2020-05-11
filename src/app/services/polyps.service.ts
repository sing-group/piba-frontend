/*
 *  PIBA Frontend
 *
 * Copyright (C) 2018-2020 - Miguel Reboiro-Jato,
 * Daniel Glez-Peña, Alba Nogueira Rodríguez, Florentino Fdez-Riverola,
 * Rubén Domínguez Carbajales, Jesús Miguel Herrero Rivas,
 * Eloy Sánchez Hernández, Laura Rivas Moral,
 * Manuel Puga Jiménez de Azcárate, Joaquín Cubiella Fernández,
 * Hugo López-Fernández, Silvia Rodríguez Iglesias, Fernando Campos Tato.
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {LOCATION, LST, NICE, PARIS, Polyp, WASP} from '../models/Polyp';
import {environment} from '../../environments/environment';
import {PolypInfo} from './entities/PolypInfo';
import {EnumUtils} from '../utils/enum.utils';
import {map} from 'rxjs/operators';
import {
  Adenoma,
  AdenomaDysplasingGrade,
  AdenomaType,
  Hyperplastic,
  Invasive,
  NoHistology,
  NonEpithelialNeoplastic,
  PolypHistology,
  PolypType,
  SSA,
  SsaDysplasingGrade,
  TSA,
  TsaDysplasingGrade
} from '../models/PolypHistology';
import {
  AdenomaInfo,
  HyperplasticInfo,
  InvasiveInfo,
  isAdenomaInfo,
  isHyperplasticInfo,
  isInvasiveInfo,
  isNoHistologyInfo,
  isNonEpithelialNeoplasticInfo,
  isSSAInfo,
  isTSAInfo,
  NoHistologyInfo,
  NonEpithelialNeoplasticInfo,
  PolypHistologyInfo,
  SSAInfo,
  TSAInfo
} from './entities/PolypHistologyInfo';
import {PolypPage} from './entities/PolypPage';

@Injectable()
export class PolypsService {

  constructor(private http: HttpClient) {
  }

  public static mapPolypInfo(polypInfo: PolypInfo): Polyp {
    return {
      id: polypInfo.id,
      name: polypInfo.name,
      size: polypInfo.size,
      location: LOCATION[polypInfo.location],
      wasp: WASP[polypInfo.wasp],
      nice: NICE[polypInfo.nice],
      lst: LST[polypInfo.lst],
      parisPrimary: PARIS[polypInfo.parisPrimary],
      parisSecondary: PARIS[polypInfo.parisSecondary],
      histology: PolypsService.mapPolypHistologyInfo(polypInfo.histology),
      observation: polypInfo.observation,
      polypRecordings: [],
      exploration: typeof polypInfo.exploration === 'string' ? polypInfo.exploration : polypInfo.exploration.id,
      confirmed: polypInfo.confirmed
    };
  }

  private static mapPolypHistologyInfo(polypHistologyInfo: PolypHistologyInfo): PolypHistology {
    if (isAdenomaInfo(polypHistologyInfo)) {
      return new Adenoma(
        AdenomaType[polypHistologyInfo.adenomaType],
        AdenomaDysplasingGrade[polypHistologyInfo.adenomaDysplasingGrade]
      );
    }
    if (isTSAInfo(polypHistologyInfo)) {
      return new TSA(
        TsaDysplasingGrade[polypHistologyInfo.tsaDysplasingGrade]
      );
    }

    if (isSSAInfo(polypHistologyInfo)) {
      return new SSA(
        SsaDysplasingGrade[polypHistologyInfo.ssaDysplasingGrade]
      );
    }

    if (isInvasiveInfo(polypHistologyInfo)) {
      return new Invasive();
    }

    if (isHyperplasticInfo(polypHistologyInfo)) {
      return new Hyperplastic();
    }

    if (isNonEpithelialNeoplasticInfo(polypHistologyInfo)) {
      return new NonEpithelialNeoplastic();
    }

    if (isNoHistologyInfo(polypHistologyInfo)) {
      return new NoHistology();
    }
    return new PolypHistology(null);
  }

  createPolyp(polyp: Polyp): Observable<Polyp> {
    const polypInfo: PolypInfo = this.toPolypInfo(polyp);

    return this.http.post<PolypInfo>(`${environment.restApi}/polyp`, polypInfo)
      .pipe(
        map(PolypsService.mapPolypInfo)
      );
  }

  getPolyp(uuid: string): Observable<Polyp> {
    return this.http.get<PolypInfo>(`${environment.restApi}/polyp/${uuid}`)
      .pipe(
        map(PolypsService.mapPolypInfo)
      );
  }

  editPolyp(polyp: Polyp): Observable<Polyp> {
    const polypInfo: PolypInfo = this.toPolypInfo(polyp);

    return this.http.put<PolypInfo>(`${environment.restApi}/polyp/${polypInfo.id}`, polypInfo)
      .pipe(
        map(PolypsService.mapPolypInfo)
      );
  }

  editPolyps(polyps: Polyp[]): Observable<Polyp[]> {
    const polypsInfo: PolypInfo[] = polyps.map(polyp => this.toPolypInfo(polyp));

    return this.http.put<PolypInfo[]>(`${environment.restApi}/polyp/`, polypsInfo).pipe(
      map(polypsInfoReturned => polypsInfoReturned.map(PolypsService.mapPolypInfo))
    );
  }

  getPolypsOfExploration(explorationId: string): Observable<Polyp[]> {
    return this.http.get<PolypInfo[]>(`${environment.restApi}/exploration/${explorationId}/polyps`)
      .pipe(
        map(polypsInfo => polypsInfo.map(PolypsService.mapPolypInfo))
      );
  }

  getPolyps(page: number, pageSize: number): Observable<PolypPage> {
    const params = new HttpParams()
      .append('page', page.toString())
      .append('pageSize', pageSize.toString());

    return this.http.get<PolypInfo[]>(`${environment.restApi}/polyp`, {params, observe: 'response'})
      .pipe(
        map(response => ({
          totalItems: Number(response.headers.get('X-Pagination-Total-Items')),
          polyps: response.body.map(PolypsService.mapPolypInfo)
        }))
      );
  }

  delete(uuid: string) {
    return this.http.delete((`${environment.restApi}/polyp/` + uuid));
  }

  private toPolypInfo(polyp: Polyp): PolypInfo {
    return {
      id: polyp.id,
      name: polyp.name,
      size: polyp.size,
      location: EnumUtils.findKeyForValue(LOCATION, polyp.location),
      wasp: EnumUtils.findKeyForValue(WASP, polyp.wasp),
      nice: EnumUtils.findKeyForValue(NICE, polyp.nice),
      lst: EnumUtils.findKeyForValue(LST, polyp.lst),
      parisPrimary: EnumUtils.findKeyForValue(PARIS, polyp.parisPrimary),
      parisSecondary: EnumUtils.findKeyForValue(PARIS, polyp.parisSecondary),
      histology: this.toPolypHistologyInfo(polyp.histology),
      observation: polyp.observation,
      exploration: typeof polyp.exploration === 'string' ? polyp.exploration : polyp.exploration.id,
      confirmed: polyp.confirmed
    };
  }

  private toPolypHistologyInfo(polypHistology: PolypHistology): PolypHistologyInfo {
    if (polypHistology !== undefined && polypHistology !== null) {
      switch (polypHistology.polypType) {
        case PolypType.ADENOMA:
          return new AdenomaInfo(
            EnumUtils.findKeyForValue(AdenomaType, (<Adenoma>polypHistology).type),
            EnumUtils.findKeyForValue(AdenomaDysplasingGrade, (<Adenoma>polypHistology).dysplasingGrade));
        case PolypType.INVASIVE:
          return new InvasiveInfo();
        case PolypType.HYPERPLASTIC:
          return new HyperplasticInfo();
        case PolypType.SESSILE_SERRATED_ADENOMA:
          return new SSAInfo(
            EnumUtils.findKeyForValue(SsaDysplasingGrade, (<SSA>polypHistology).dysplasingGrade));
        case PolypType.TRADITIONAL_SERRATED_ADENOMA:
          return new TSAInfo(
            EnumUtils.findKeyForValue(TsaDysplasingGrade, (<TSA>polypHistology).dysplasingGrade));
        case PolypType.NON_EPITHELIAL_NEOPLASTIC:
          return new NonEpithelialNeoplasticInfo();
        case PolypType.NO_HISTOLOGY:
          return new NoHistologyInfo();
        default:
          return null;
          break;
      }
    }
  }
}
