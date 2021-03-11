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

import {Exploration} from './Exploration';
import {PolypRecording} from './PolypRecording';
import {PolypHistology} from './PolypHistology';
import {VideoZoneType} from './VideoZoneType';

export class Polyp implements VideoZoneType {
  id: string;
  name: string;
  size: number;
  location: LOCATION;
  wasp: WASP;
  nice: NICE;
  lst: LST;
  parisPrimary: PARIS;
  parisSecondary: PARIS;
  histology: PolypHistology;
  observation: string;
  polypRecordings: PolypRecording[];
  exploration: Exploration | string;
  confirmed: boolean;
}

export enum WASP {
  WASP_POSITIVE = 'WASP +', WASP_NEGATIVE= 'WASP -'
}

export enum NICE {
  TYPE_1 = 'Type 1', TYPE_2 = 'Type 2', TYPE_3 = 'Type 3'
}

export enum LST {
  HOMOGENOUS = '(IIa) Homogenous', NODULAR_MIXED = '(IIa + Is) Nodular mixed', ELEVATED = '(IIa) Elevated',
  PSEUDODEPRESSED = '(IIc + IIa) Pseudodepressed'
}

export enum PARIS {
  PEDUNCULATED = '(0-Ip) Pedunculated', SESSILE = '(0-Is) Sessile',
  SLIGHTLY_ELEVATED = '(0-IIa) Slightly elevated', FLAT = '(0-IIb) Flat', DEPRESSED = '(0-IIc) depressed',
  ULCERATED = '(0-III) Excavated/Ulcerated'
}

export enum LOCATION {
  CECUM = 'Cecum', ASCENDING_COLON = 'Ascending colon', HEPATIC_FLEXURE = 'Hepatic flexure', TRANSVERSE_COLON = 'Transverse colon',
  SPLENIC_FLEXURE = 'Splenic flexure', DESCENDING_COLON = 'Descending colon', SIGMOID = 'Sigmoid', RECTUM = 'Rectum'
}
