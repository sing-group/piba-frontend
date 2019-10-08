import {VideoZoneType} from './VideoZoneType';
import {Interval} from './Interval';

export interface ElementInVideoZone extends Interval {
  id: number;
  element: VideoZoneType;
  confirmed: boolean;
}
