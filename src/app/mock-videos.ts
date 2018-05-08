import { Video } from './model/video';
import { Polyp } from './model/polyp';

export const VIDEOS: Video[] = [
    {
        id: 1, title: 'Video 1', observation: 'nothing', url: 'http://static.sing-group.org/polydeep/videos/sample-exploration',
        polyps: [{
            id: 1, name: 'polyp 1', size: 11, location: 'right colon', wasp: 'Type I', nice: '1', lst: '1', paris: 'Category 0-1', histology: 'histology',
            videos: [{
                id: 1, title: 'Video', observation: 'nothing', url: '../assets/img/1.jpg', polyps: []
            }]
        }]
    },
    {
        id: 2, title: 'Video 2', observation: 'nothing', url: 'http://static.sing-group.org/polydeep/videos/sample-exploration',
        polyps: []
    }
];