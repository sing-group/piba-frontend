import {IdAndUri} from './IdAndUri';

export interface PolypRecordingInfo {
  id: number;
  video: IdAndUri | string;
  polyp: IdAndUri | string;
  start: number;
  end: number;
  confirmed: boolean;
}
