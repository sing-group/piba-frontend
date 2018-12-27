import {Video} from './Video';
import {Gallery} from './Gallery';

export class Image {
  id: string;
  numFrame: number;
  isRemoved: boolean;
  base64contents: string;
  gallery: Gallery;
  video: Video;
}
