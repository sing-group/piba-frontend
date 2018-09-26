import {Exploration} from './Exploration';
import {PolypRecording} from './PolypRecording';

export class Polyp {
  id: string;
  name: string;
  size: number;
  location: string;
  wasp: WASP;
  nice: NICE;
  lst: LST;
  paris: PARIS;
  histology: string;
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
  HOMOGENOUS = 'Homogenous', NODULAR_MIXED = 'Nodular mixed', ELEVATED = 'Elevated', PSEUDODEPRESSED = 'Pseudodepressed'
}

export enum PARIS {
  PEDUNCULATED = 'Pendunculated', SESSILE = 'Sessile', MIXED = 'Mixed', SLIGHTLY_ELEVATED = 'Slightly elevated', FLAT = 'Flat',
  SLIGHTLY_DEPRESSED = 'Slightly depressed', ELEVATED_DEPRESSED = 'Elevated depressed', DEPRESSED_ELEVATED = 'Depressed elevated',
  SESSILE_DEPRESSED = 'Sessile depressed'
}
