import {IdAndUri} from './IdAndUri';

export class VideoModificationInfo {
  id: number;
  video: IdAndUri | string;
  modifier: IdAndUri | string;
  start: number;
  end: number;
}
