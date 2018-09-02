import IdAndUri from './IdAndUri';

export default interface PolypRecordingInfo {
  video: IdAndUri;
  polyp: IdAndUri;
  start: number;
  end: number;
}
