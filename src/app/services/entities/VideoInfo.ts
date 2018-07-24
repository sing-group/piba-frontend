export default interface VideoInfo {
  id: string;
  title: string;
  observations: string;
  video_sources: VideoSource[];
  processing: boolean;
  exploration_id: string;
}

export interface VideoSource {
  type: string;
  src: string;
}
