import IdAndUri from './IdAndUri';

export default interface PolypRecordingInfo {
  video: IdAndUri | string;
  polyp: IdAndUri | string;
  start: number;
  end: number;
}
