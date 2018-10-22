import {IdAndUri} from './IdAndUri';
import {PolypHistologyInfo} from './PolypHistologyInfo';

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
  histology: PolypHistologyInfo;
  observation: string;
  exploration: IdAndUri | string;
}
