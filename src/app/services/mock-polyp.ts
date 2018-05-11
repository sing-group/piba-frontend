import { Polyp } from '../models/polyp';

export const POLYPS: Polyp[] = [
    {
        id: 'e97845af-5c6c-414d-84ed-98cd49f08eff',
        name: 'Polyp 1',
        size: 11,
        location: 'right colon',
        wasp: 'Type I',
        nice: '1',
        lst: '1',
        paris: 'Category 0-1',
        histology: 'histology',
        videos: [{
            id: '283e9222-f189-4d03-8382-c0942d8d5b2b',
            title: 'Video',
            observation: 'nothing',
            url: 'http://static.sing-group.org/polydeep/videos/sample-exploration',
            polyps: []
        }]
    },
    {
        id: '78c87dd9-578e-41d6-aab3-de32e18da38e',
        name: 'Polyp 2',
        size: 11,
        location: 'Left colon',
        wasp: 'Type I',
        nice: '1',
        lst: '1',
        paris: 'Category 0-1',
        histology: 'Histology',
        videos: []
    }
];
