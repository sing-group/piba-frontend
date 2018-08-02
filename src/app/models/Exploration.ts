import Video from "./Video";
import Polyp from "./Polyp";

export default class Exploration {
    id: string;
    date: Date;
    location: string;
    videos: Video[];
    polyps: Polyp[];
}