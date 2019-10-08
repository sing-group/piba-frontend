import {Video} from './Video';
import {Polyp} from './Polyp';
import {Patient} from './Patient';

export class Exploration {
  id: string;
  title: string;
  explorationDate: Date;
  location: string;
  videos: Video[];
  polyps: Polyp[];
  numVideos: number;
  numPolyps: number;
  patient: Patient;
  confirmed: boolean;
}
