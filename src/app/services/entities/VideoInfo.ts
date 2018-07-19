export default interface VideoInfo {
  id: string;
  title: string;
  observations: string;
  video_sources: VideoSource[];
  processing: boolean;
}

export interface VideoSource {
  type: string;
  src: string;
}
