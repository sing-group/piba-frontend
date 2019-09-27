import {VideoSource} from './VideoUrl';
import {PolypRecording} from './PolypRecording';
import {VideoModification} from './VideoModification';

export class Video {
  id: string;
  title: string;
  observations: string;
  sources: VideoSource[];
  polypRecording: PolypRecording[];
  modifications: VideoModification[];
  isProcessing: boolean;
  withText: boolean;
  fps: number;
  exploration: string;
}
