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

  getModifier(id: string): Observable<Modifier> {
    return this.http.get<ModifierInfo>(`${environment.restApi}/modifier/${id}`)
      .pipe(
        map(this.mapModifierInfo)
      );
  }

  createModifier(modifier: Modifier): Observable<Modifier> {
    const modifierInfo = this.toModifierInfo(modifier);
    return this.http.post<ModifierInfo>(`${environment.restApi}/modifier`, modifierInfo)
      .pipe(
        map(this.mapModifierInfo.bind(this))
      );
  }

  deleteModifier(id: string) {
    return this.http.delete(`${environment.restApi}/modifier/${id}`);
  }

  private mapModifierInfo(modifierInfo: ModifierInfo): Modifier {
    return {
      id: modifierInfo.id,
      name: modifierInfo.name
    };
  }

  private toModifierInfo(modifier: Modifier): ModifierInfo {
    return {
      id: modifier.id,
      name: modifier.name
    };
  }
}
