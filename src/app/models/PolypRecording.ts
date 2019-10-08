import {Video} from './Video';
import {Polyp} from './Polyp';

export interface PolypRecording {
  id: number;
  video: Video;
  polyp: Polyp;
  start: number;
  end: number;
  confirmed: boolean;
}
