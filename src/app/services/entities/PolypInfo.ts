import IdAndUri from './IdAndUri';

export default interface PolypInfo {
    id: string;
    name: string;
    size: number;
    location: string;
    wasp: string;
    nice: string;
    lst: string;
    paris: string;
    histology: string;
    exploration: IdAndUri | string;
}
