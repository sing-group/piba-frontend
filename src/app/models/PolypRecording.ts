import {Video} from './Video';
import {Polyp} from './Polyp';

export interface PolypRecording {
  video: Video;
  polyp: Polyp;
  start: number;
  end: number;
}
