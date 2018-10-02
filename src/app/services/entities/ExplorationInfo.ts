import {IdAndUri} from './IdAndUri';

export interface ExplorationInfo {
  id: string;
  title: string;
  date: Date;
  location: string;
  videos?: IdAndUri[];
  polyps?: IdAndUri[];
  patient: string | IdAndUri;
}
