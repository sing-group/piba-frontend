import Video from './Video';
import {Modifier} from './Modifier';

export class VideoModification {
  id: number;
  video: Video;
  modifier: Modifier;
  start: number;
  end: number;
}
