import { Video } from '../models/video';
import { Polyp } from '../models/polyp';

export const VIDEOS: Video[] = [
    {
        id: '283e9222-f189-4d03-8382-c0942d8d5b2b',
        title: 'Video 1',
        observation: 'Nothing',
        url: 'http://static.sing-group.org/polydeep/videos/sample-exploration',
        polyps: [{
            id: 'e97845af-5c6c-414d-84ed-98cd49f08eff',
            name: 'Polyp 1',
            size: 11,
            location: 'Right colon',
            wasp: 'Type I',
            nice: '1',
            lst: '1',
            paris: 'Category 0-1',
            histology: 'histology',
            videos: [{
                id: '283e9222-f189-4d03-8382-c0942d8d5b2b',
                title: 'Video',
                observation: 'Nothing',
                url: '../assets/img/1.jpg',
                polyps: []
            }]
        }]
    },
    {
        id: 'c1921367-a9db-4289-846a-7a345194be24',
        title: 'Video 2',
        observation: 'Nothing',
        url: 'http://static.sing-group.org/polydeep/videos/sample-exploration',
        polyps: []
    }
];
