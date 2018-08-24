import VideoSource from './VideoUrl';
import PolypRecording from './PolypRecording';

export default class Video {
    id: string;
    title: string;
    observations: string;
    sources: VideoSource[];
    polypRecording: PolypRecording[];
    isProcessing: boolean;
    exploration: string;
}
