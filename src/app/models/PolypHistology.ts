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

import {EnumUtils} from '../utils/enum.utils';

export enum PolypType {
  ADENOMA = 'Adenoma',
  INVASIVE = 'Invasive adenocarcinoma',
  HYPERPLASTIC = 'Hyperplastic polyp',
  SESSILE_SERRATED_ADENOMA = 'Sessile serrated adenoma',
  TRADITIONAL_SERRATED_ADENOMA = 'Traditional serrated adenoma',
  NON_EPITHELIAL_NEOPLASTIC = 'Non-epithelial/Non-neoplastic',
  NO_HISTOLOGY = 'No histology'
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

export class NoHistology extends PolypHistology {
  constructor() {
    super(PolypType.NO_HISTOLOGY);
  }
}
