import Video from './Video';
import Polyp from './Polyp';
import Patient from './Patient';

export default class Exploration {
    id: string;
    date: Date;
    location: string;
    videos: Video[];
    polyps: Polyp[];
    patient: Patient;
}
