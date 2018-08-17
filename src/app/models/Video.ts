import VideoSource from './VideoUrl';
import PolypRecording from './PolypRecording';

export default class Video {
    id: string;
    title: string;
    observation: string;
    sources: VideoSource[];
    polypRecording: PolypRecording[];
    isProcessing: boolean;
    exploration_id: string;
}
