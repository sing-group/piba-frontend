import { Polyp } from './model/polyp';

export const POLYPS: Polyp[] = [
    {
        id: 1, name: 'polyp 1', size: 11, location: 'right colon', wasp: 'Type I', nice: '1', lst: '1', paris: 'Category 0-1', histology: 'histology',
        videos: [{
            id: 1, title: 'Video', observation: 'nothing', url: 'http://static.sing-group.org/polydeep/videos/sample-exploration', polyps: []
        }]
    },
    {
        id: 2, name: 'polyp 2', size: 11, location: 'left colon', wasp: 'Type I', nice: '1', lst: '1', paris: 'Category 0-1', histology: 'histology', videos: []
    }
];