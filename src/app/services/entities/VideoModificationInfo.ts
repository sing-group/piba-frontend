import IdAndUri from './IdAndUri';

export class VideoModificationInfo {
  video: IdAndUri | string;
  modifier: IdAndUri | string;
  start: number;
  end: number;
}
