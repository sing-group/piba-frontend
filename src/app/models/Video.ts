import {VideoSource} from './VideoUrl';
import {PolypRecording} from './PolypRecording';

export class Video {
  id: string;
  title: string;
  observations: string;
  sources: VideoSource[];
  polypRecording: PolypRecording[];
  isProcessing: boolean;
  withText: boolean;
  fps: number;
  exploration: string;
}
