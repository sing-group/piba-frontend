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
  exploration: Exploration;
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
  PEDUNCULATED = '(0-Ip) Pendunculated', SESSILE = '(0-Is) Sessile',
  SLIGHTLY_ELEVATED = '(0-IIa) Slightly elevated', FLAT = '(0-IIb) Flat', DEPRESSED = '(0-IIc) depressed',
  ULCERATED = '(0-III) Excavated/Ulcerated'
}

export enum LOCATION {
  CECUM = 'Cecum', ASCENDING_COLON = 'Ascending colon', HEPATIC_FLEXURE = 'Hepatic flexure', TRANSVERSE_COLON = 'Transverse colon',
  SPLENIC_FLEXURE = 'Splenic flexure', DESCENDING_COLON = 'Descending colon', SIGMOID = 'Sigmoid', RECTUM = 'Rectum'
}
