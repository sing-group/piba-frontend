import {IdAndUri} from './IdAndUri';

export interface ExplorationInfo {
  id: string;
  date: Date;
  location: string;
  videos?: IdAndUri[];
  polyps?: IdAndUri[];
  patient: string | IdAndUri;
}
