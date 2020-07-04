/*
 *  PIBA Frontend
 *
 * Copyright (C) 2018-2020 - Miguel Reboiro-Jato,
 * Daniel Glez-Peña, Alba Nogueira Rodríguez, Florentino Fdez-Riverola,
 * Rubén Domínguez Carbajales, Jesús Miguel Herrero Rivas,
 * Eloy Sánchez Hernández, Laura Rivas Moral,
 * Manuel Puga Jiménez de Azcárate, Joaquín Cubiella Fernández,
 * Hugo López-Fernández, Silvia Rodríguez Iglesias, Fernando Campos Tato.
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

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

  private static mapModifierInfo(modifierInfo: ModifierInfo): Modifier {
    return {
      id: modifierInfo.id,
      name: modifierInfo.name
    };
  }

  private static toModifierInfo(modifier: Modifier): ModifierInfo {
    return {
      id: modifier.id,
      name: modifier.name
    };
  }

  constructor(private http: HttpClient) {
  }

  listModifiers(): Observable<Modifier[]> {
    return this.http.get<ModifierInfo[]>(`${environment.restApi}/modifier/`)
      .pipe(
        map(modifiers => modifiers.map(ModifiersService.mapModifierInfo))
      );
  }

  getModifier(id: string): Observable<Modifier> {
    return this.http.get<ModifierInfo>(`${environment.restApi}/modifier/${id}`)
      .pipe(
        map(ModifiersService.mapModifierInfo)
      );
  }

  createModifier(modifier: Modifier): Observable<Modifier> {
    const modifierInfo = ModifiersService.toModifierInfo(modifier);
    return this.http.post<ModifierInfo>(`${environment.restApi}/modifier`, modifierInfo)
      .pipe(
        map(ModifiersService.mapModifierInfo)
      );
  }

  editModifier(modifier: Modifier): Observable<Modifier> {
    const modifierInfo = ModifiersService.toModifierInfo(modifier);
    return this.http.put<ModifierInfo>(`${environment.restApi}/modifier/${modifierInfo.id}`, modifierInfo)
      .pipe(
        map(ModifiersService.mapModifierInfo)
      );
  }

  deleteModifier(id: string) {
    return this.http.delete(`${environment.restApi}/modifier/${id}`);
  }
}
