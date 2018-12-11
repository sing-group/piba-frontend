import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
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
  isNonEpithelialNeoplasticInfo,
  isSSAInfo,
  isTSAInfo, NonEpithelialNeoplasticInfo,
  PolypHistologyInfo,
  SSAInfo,
  TSAInfo
} from './entities/PolypHistologyInfo';

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
        map(this.mapPolypInfo.bind(this))
      );
  }

  editPolyp(polyp: Polyp): Observable<Polyp> {
    const polypInfo: PolypInfo = this.toPolypInfo(polyp);

    return this.http.put<PolypInfo>(`${environment.restApi}/polyp/${polypInfo.id}`, polypInfo)
      .pipe(
        map(this.mapPolypInfo.bind(this))
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
      location: LOCATION[polypInfo.location],
      wasp: WASP[polypInfo.wasp],
      nice: NICE[polypInfo.nice],
      lst: LST[polypInfo.lst],
      parisPrimary: PARIS[polypInfo.parisPrimary],
      parisSecondary: PARIS[polypInfo.parisSecondary],
      histology: this.mapPolypHistologyInfo(polypInfo.histology),
      observation: polypInfo.observation,
      polypRecordings: [],
      exploration: null
    };
  }

  private mapPolypHistologyInfo(polypHistologyInfo: PolypHistologyInfo): PolypHistology {
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
    return new PolypHistology(null);
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
      exploration: polyp.exploration.id
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
        default:
          return null;
          break;
      }
    }
  }

}
