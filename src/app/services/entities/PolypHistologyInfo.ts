import {EnumUtils} from '../../utils/enum.utils';
import {PolypType} from '../../models/PolypHistology';

export class PolypHistologyInfo {
  id: string;
  polypType: string;

  constructor(polypType: string) {
    this.polypType = polypType;
  }
}

export function isPolypHistologyInfo(object: any) {
  return object && (
    object instanceof PolypHistologyInfo
    || (
      object.id && typeof object.id === 'string'
      && object.polypType && typeof object.polypType === 'string'
    )
  );
}

export class AdenomaInfo extends PolypHistologyInfo {
  adenomaType: string;
  adenomaDysplasingGrade: string;

  constructor(adenomaType: string, adenomaDysplasingGrade: string) {
    super(EnumUtils.findKeyForValue(PolypType, PolypType.ADENOMA));
    this.adenomaType = adenomaType;
    this.adenomaDysplasingGrade = adenomaDysplasingGrade;
  }
}

export function isAdenomaInfo(object: any): object is AdenomaInfo {
  return isPolypHistologyInfo(object) && (
    object instanceof AdenomaInfo
    || (
      object.adenomaType && typeof object.adenomaType === 'string'
      && object.adenomaDysplasingGrade && typeof object.adenomaDysplasingGrade === 'string'
      && object.polypType === EnumUtils.findKeyForValue(PolypType, PolypType.ADENOMA)
    )
  );
}

export class InvasiveInfo extends PolypHistologyInfo {
  private ___attribute_to_differentiate_from_PolypHistologyInfo: string;

  constructor() {
    super(EnumUtils.findKeyForValue(PolypType, PolypType.INVASIVE));

  }
}

export function isInvasiveInfo(object: any): object is InvasiveInfo {
  return isPolypHistologyInfo(object) && (
    object instanceof InvasiveInfo
    || (
      object.polypType === EnumUtils.findKeyForValue(PolypType, PolypType.INVASIVE)
    )
  );
}

export class HyperplasticInfo extends PolypHistologyInfo {
  private ___attribute_to_differentiate_from_PolypHistologyInfo: string;

  constructor() {
    super(EnumUtils.findKeyForValue(PolypType, PolypType.HYPERPLASTIC));
  }
}

export function isHyperplasticInfo(object: any): object is HyperplasticInfo {
  return isPolypHistologyInfo(object) && (
    object instanceof HyperplasticInfo
    || (
      object.polypType === EnumUtils.findKeyForValue(PolypType, PolypType.HYPERPLASTIC)
    )
  );
}


export class SSAInfo extends PolypHistologyInfo {
  ssaDysplasingGrade: string;

  constructor(ssaDysplasingGrade: string) {
    super(EnumUtils.findKeyForValue(PolypType, PolypType.SESSILE_SERRATED_ADENOMA));
    this.ssaDysplasingGrade = ssaDysplasingGrade;
  }
}

export function isSSAInfo(object: any): object is SSAInfo {
  return isPolypHistologyInfo(object) && (
    object instanceof SSAInfo
    || (
      object.ssaDysplasingGrade && typeof object.ssaDysplasingGrade === 'string'
      && object.polypType === EnumUtils.findKeyForValue(PolypType, PolypType.SESSILE_SERRATED_ADENOMA)
    )
  );
}

export class TSAInfo extends PolypHistologyInfo {
  tsaDysplasingGrade: string;

  constructor(tsaDysplasingGrade: string) {
    super(EnumUtils.findKeyForValue(PolypType, PolypType.TRADITIONAL_SERRATED_ADENOMA));
    this.tsaDysplasingGrade = tsaDysplasingGrade;
  }
}

export function isTSAInfo(object: any): object is TSAInfo {
  return isPolypHistologyInfo(object) && (
    object instanceof TSAInfo
    || (
      object.tsaDysplasingGrade && typeof object.tsaDysplasingGrade === 'string'
      && object.polypType === EnumUtils.findKeyForValue(PolypType, PolypType.TRADITIONAL_SERRATED_ADENOMA)
    )
  );
}
