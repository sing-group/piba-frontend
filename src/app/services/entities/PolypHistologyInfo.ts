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

export class NonEpithelialNeoplasticInfo extends PolypHistologyInfo {
  private ___attribute_to_differentiate_from_PolypHistologyInfo: string;

  constructor() {
    super(EnumUtils.findKeyForValue(PolypType, PolypType.NON_EPITHELIAL_NEOPLASTIC));
  }
}

export function isNonEpithelialNeoplasticInfo(object: any): object is NonEpithelialNeoplasticInfo {
  return isPolypHistologyInfo(object) && (
    object instanceof NonEpithelialNeoplasticInfo
    || (
      object.polypType === EnumUtils.findKeyForValue(PolypType, PolypType.NON_EPITHELIAL_NEOPLASTIC
      )
    )
  );
}

export class NoHistologyInfo extends PolypHistologyInfo {
  private ___attribute_to_differentiate_from_PolypHistologyInfo: string;

  constructor() {
    super(EnumUtils.findKeyForValue(PolypType, PolypType.NO_HISTOLOGY));
  }
}

export function isNoHistologyInfo(object: any): object is NonEpithelialNeoplasticInfo {
  return isPolypHistologyInfo(object) && (
    object instanceof NoHistologyInfo
    || (
      object.polypType === EnumUtils.findKeyForValue(PolypType, PolypType.NO_HISTOLOGY
      )
    )
  );
}
