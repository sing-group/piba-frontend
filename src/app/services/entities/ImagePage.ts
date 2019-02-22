import {Image} from '../../models/Image';

export interface ImagePage {
  totalItems: number;
  locatedImages: number;
  images: Image[];
}
