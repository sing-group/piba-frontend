import Polyp from './Polyp';
import VideoSource from './VideoUrl';

export default class Video {
    id: string;
    title: string;
    observation: string;
    sources: VideoSource[];
    polyps: Polyp[];
}
