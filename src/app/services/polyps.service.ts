import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { Polyp } from '../models/polyp';
import { POLYPS } from './mock-polyp';

@Injectable()
export class PolypsService {

  constructor() { }

  getPolyps(): Observable<Polyp[]> {
    return of(POLYPS);
  }
}
