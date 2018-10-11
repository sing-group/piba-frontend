import {IdAndUri} from './IdAndUri';

export interface PolypInfo {
  id: string;
  name: string;
  size: number;
  location: string;
  wasp: string;
  nice: string;
  lst: string;
  parisPrimary: string;
  parisSecondary: string;
  histology: string;
  observation: string;
  exploration: IdAndUri | string;
}
