import {Exploration} from './Exploration';
import {PolypRecording} from './PolypRecording';

export class Polyp {
  id: string;
  name: string;
  size: number;
  location: LOCATION;
  wasp: WASP;
  nice: NICE;
  lst: LST;
  paris: PARIS;
  histology: string;
  observation: string;
  polypRecordings: PolypRecording[];
  exploration: Exploration;
}

export enum WASP {
  HYPERPLASTIC = 'Hyperplastic', SERRATED = 'Serrated', ADENOMA = 'Adenoma'
}

export enum NICE {
  TYPE_1 = 'Type 1', TYPE_2 = 'Type 2', TYPE_3 = 'Type 3'
}

export enum LST {
  HOMOGENOUS = '(IIa) Homogenous', NODULAR_MIXED = '(IIa + Is) Nodular mixed', ELEVATED = '(IIa) Elevated',
  PSEUDODEPRESSED = '(IIc + IIa) Pseudodepressed'
}

export enum PARIS {
  PEDUNCULATED = '(0-1p) Pendunculated', SESSILE = '(0-1s) Sessile', MIXED = '(0-1sp) Mixed',
  SLIGHTLY_ELEVATED = '(0-IIa) Slightly elevated', FLAT = '(0-IIb) Flat', SLIGHTLY_DEPRESSED = '(0-IIc) Slightly depressed',
  ELEVATED_DEPRESSED = '(0-IIa + IIc)  Elevated depressed', DEPRESSED_ELEVATED = '(0-IIc + IIa) Depressed elevated',
  SESSILE_DEPRESSED = '(0-1s + IIc) Sessile depressed'
}

export enum LOCATION {
  CECUM = 'Cecum', ASCENDING_COLON = 'Ascending color', HEPATIC_FLEXURE = 'Hepatic flexure', TRANSVERSE_COLON = 'Transverse color',
  SPLENIC_FLEXURE = 'Splenic flexure', DESCENDING_COLON = 'Descending color', SIGMOID = 'Sigmoid', RECTUM = 'Rectum'
}
