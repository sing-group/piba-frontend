import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Modifier} from '../models/Modifier';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';
import {ModifierInfo} from './entities/ModifierInfo';

@Injectable({
  providedIn: 'root'
})
export class ModifiersService {

  constructor(private http: HttpClient) {
  }

  getModifiers(): Observable<Modifier[]> {
    return this.http.get<ModifierInfo[]>(`${environment.restApi}/modifier/`)
      .pipe(
        map(modifiers => modifiers.map(this.mapModifierInfo.bind(this)))
      );
  }

  private mapModifierInfo(modifierInfo: ModifierInfo): Modifier {
    return {
      id: modifierInfo.id,
      name: modifierInfo.name
    };
  }
}
