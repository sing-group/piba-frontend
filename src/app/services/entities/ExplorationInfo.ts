import {IdAndUri} from './IdAndUri';

export interface ExplorationInfo {
  id: string;
  title: string;
  explorationDate: Date;
  location: string;
  videos?: IdAndUri[];
  polyps?: IdAndUri[];
  numVideos?: number;
  numPolyps?: number;
  patient: string | IdAndUri;
  confirmed: boolean;
}
