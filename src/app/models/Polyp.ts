import Video from './Video';

export default class Polyp {
    id: string;
    name: string;
    size: number;
    location: string;
    wasp: WASP;
    nice: NICE;
    lst: LST;
    paris: PARIS;
    histology: string;
    videos: Video[];
}

export enum WASP {
    HYPERPLASTIC, SERRATED, ADENOMA
}

export enum NICE {
    TYPE_1, TYPE_2, TYPE_3
}

export enum LST {
    HOMOGENOUS, NODULAR_MIXED, ELEVATED, PSEUDODEPRESSED
}

export enum PARIS {
    PEDUNCULATED, SESSILE, MIXED, SLIGHTLY_ELEVATED, FLAT, SLIGHTLY_DEPRESSED, ELEVATED_DEPRESSED, DEPRESSED_ELEVATED,
    SESSILE_DEPRESSED
}
