import {Video} from './Video';
import {Gallery} from './Gallery';
import {PolypLocation} from './PolypLocation';
import {Polyp} from './Polyp';

export class Image {
  id: string;
  numFrame: number;
  isRemoved: boolean;
  base64contents: string;
  gallery: Gallery;
  video: Video;
  polyp: Polyp;
  polypLocation: PolypLocation;
  observation: string;
  manuallySelected: boolean;
}
