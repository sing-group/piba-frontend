import IdAndUri from "./IdAndUri";

export default interface ExplorationInfo {
    id: string;
    date: Date;
    location: string;
    videos?: IdAndUri[];
    polyps?: IdAndUri[];
}