import {IdAndUri} from './IdAndUri';

export interface PolypRecordingInfo {
  video: IdAndUri | string;
  polyp: IdAndUri | string;
  start: number;
  end: number;
}
