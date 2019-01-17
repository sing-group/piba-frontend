import {IdAndUri} from './IdAndUri';

export interface VideoInfo {
  id: string;
  title: string;
  observations: string;
  video_sources: VideoSource[];
  processing: boolean;
  withText: boolean;
  fps: number;
  exploration: IdAndUri | string;
}

export interface VideoSource {
  type: string;
  src: string;
}
