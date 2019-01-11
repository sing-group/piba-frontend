import {IdAndUri} from './IdAndUri';

export class ImageInfo {
  id: string;
  numFrame: number;
  isRemoved: boolean;
  base64contents: string;
  gallery: string | IdAndUri;
  video: string | IdAndUri;
}