import IdAndUri from "./IdAndUri";

export default interface VideoInfo {
  id: string;
  title: string;
  observations: string;
  video_sources: VideoSource[];
  processing: boolean;
  exploration: IdAndUri | string;
}

export interface VideoSource {
  type: string;
  src: string;
}
