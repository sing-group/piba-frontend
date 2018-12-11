import {EnumUtils} from '../utils/enum.utils';

export enum PolypType {
  ADENOMA = 'Adenoma',
  INVASIVE = 'Invasive adenocarcinoma',
  HYPERPLASTIC = 'Hyperplastic polyp',
  SESSILE_SERRATED_ADENOMA = 'Sessile serrated adenoma',
  TRADITIONAL_SERRATED_ADENOMA = 'Traditional serrated adenoma',
  NON_EPITHELIAL_NEOPLASTIC = 'Non-epithelial/Non-neoplastic'
}

export enum AdenomaType {
  TUBULAR = 'Tubular', TUBULOVILLOUS = 'Tubulovillous', VILLOUS = 'Villous'
}

export enum AdenomaDysplasingGrade {
  UNDEFINED = 'Undefined', LOW = 'Low', MODERATE = 'Moderate', HIGH = 'High', IN_SITU_CARCINOMA = 'In-situ Carcinoma',
  INTRAMUCOSAL_CARCINOMA = 'Intramucosal carcinoma'
}

export enum SsaDysplasingGrade {
  UNDEFINED = 'Undefined dysplasia', WITHOUT = 'Without dysplasia', LOW = 'Low dysplasia',
  MODERATE = 'Moderate dysplasia', HIGH = 'High dysplasia'
}

export enum TsaDysplasingGrade {
  UNDEFINED = 'Undefined dysplasia', LOW = 'Low dysplasia', MODERATE = 'Moderate dysplasia', HIGH = 'High dysplasia'
}

export class PolypHistology {
  id: string;
  polypType: PolypType;

  constructor(polypType: PolypType) {
    this.polypType = polypType;
  }
}

export function isPolypHistology(object: any) {
  return object && (
    object instanceof PolypHistology
    || (
      object.id && typeof object.id === 'string'
      && object.polypType && typeof object.polypType === 'string'
    )
  );
}

export class Adenoma extends PolypHistology {
  type: AdenomaType;
  dysplasingGrade: AdenomaDysplasingGrade;

  constructor(type: AdenomaType, dysplasingGrade: AdenomaDysplasingGrade) {
    super(PolypType.ADENOMA);
    this.type = type;
    this.dysplasingGrade = dysplasingGrade;
  }
}

export function isAdenoma(object: any): object is Adenoma {
  return isPolypHistology(object) && (
    object instanceof Adenoma
    || (
      object.type && typeof object.type === 'string'
      && object.dysplasingGrade && typeof object.dysplasingGrade === 'string'
      && object.polypType === EnumUtils.findKeyForValue(PolypType, PolypType.ADENOMA)
    )
  );
}

export class Invasive extends PolypHistology {
  constructor() {
    super(PolypType.INVASIVE);
  }
}

export class Hyperplastic extends PolypHistology {
  constructor() {
    super(PolypType.HYPERPLASTIC);
  }
}

export class SSA extends PolypHistology {
  dysplasingGrade: SsaDysplasingGrade;

  constructor(dysplasingGrade: SsaDysplasingGrade) {
    super(PolypType.SESSILE_SERRATED_ADENOMA);
    this.dysplasingGrade = dysplasingGrade;
  }
}

export function isSSA(object: any): object is SSA {
  return isPolypHistology(object) && (
    object instanceof SSA
    || (
      object.dysplasingGrade && typeof object.dysplasingGrade === 'string'
      && object.polypType === EnumUtils.findKeyForValue(PolypType, PolypType.SESSILE_SERRATED_ADENOMA)
    )
  );
}

export class TSA extends PolypHistology {
  dysplasingGrade: TsaDysplasingGrade;

  constructor(dysplasingGrade: TsaDysplasingGrade) {
    super(PolypType.TRADITIONAL_SERRATED_ADENOMA);
    this.dysplasingGrade = dysplasingGrade;
  }
}

export function isTSA(object: any): object is TSA {
  return isPolypHistology(object) && (
    object instanceof TSA
    || (
      object.dysplasingGrade && typeof object.dysplasingGrade === 'string'
      && object.polypType === EnumUtils.findKeyForValue(PolypType, PolypType.TRADITIONAL_SERRATED_ADENOMA)
    )
  );
}

export class NonEpithelialNeoplastic extends PolypHistology {
  constructor() {
    super(PolypType.NON_EPITHELIAL_NEOPLASTIC);
  }
}
