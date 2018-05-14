import { Polyp } from '../models/polyp';

export const POLYPS: Polyp[] = [
    {
        id: 'e97845af-5c6c-414d-84ed-98cd49f08eff',
        name: 'Polyp 1',
        size: 11,
        location: 'Right colon',
        wasp: 'Type I',
        nice: '1',
        lst: '1',
        paris: 'Category 0-1',
        histology: 'Histology',
        videos: [{
            id: '283e9222-f189-4d03-8382-c0942d8d5b2b',
            title: 'Video',
            observation: 'Nothing',
            url: 'http://static.sing-group.org/polydeep/videos/sample-exploration',
            polyps: []
        },
        {
            id: '910a2323-0m3s-9v13-4567-b1243p4d5b2b',
            title: 'Video 2',
            observation: 'Nothing',
            url: 'http://static.sing-group.org/polydeep/videos/sample-exploration',
            polyps: []
        },
        {
            id: '74w30919-4s33-8832-v32d4b42vb2b',
            title: 'Video 3',
            observation: 'Nothing',
            url: 'http://static.sing-group.org/polydeep/videos/sample-exploration',
            polyps: []
        },
        {
            id: '660m1009-3c44-7x81-5455-9s32j9o329s4',
            title: 'Video 4',
            observation: 'Nothing',
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
