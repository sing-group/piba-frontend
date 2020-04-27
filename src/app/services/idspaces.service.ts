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

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {IdSpace} from '../models/IdSpace';
import {IdSpaceInfo} from './entities/IdSpaceInfo';
import {map} from 'rxjs/operators';

@Injectable()
export class IdSpacesService {

  constructor(private http: HttpClient) {
  }

  getIdSpaces(): Observable<IdSpace[]> {
    return this.http.get<IdSpaceInfo[]>(`${environment.restApi}/idspace/`)
      .pipe(
        map(idSpaces => idSpaces.map(this.mapIdSpaceInfo.bind(this)))
      );
  }

  getIdSpace(id: string): Observable<IdSpace> {
    return this.http.get<IdSpaceInfo>(`${environment.restApi}/idspace/${id}`)
      .pipe(
        map(this.mapIdSpaceInfo.bind(this))
      );
  }

  createIdSpace(idSpace: IdSpace): Observable<IdSpace> {
    const idSpaceInfo = this.toIdSpaceInfo(idSpace);
    return this.http.post<IdSpaceInfo>(`${environment.restApi}/idspace`, idSpaceInfo)
      .pipe(
        map(this.mapIdSpaceInfo.bind(this))
      );
  }

  editIdSpace(idSpace: IdSpace): Observable<IdSpace> {
    const idSpaceInfo = this.toIdSpaceInfo(idSpace);
    return this.http.put<IdSpaceInfo>(`${environment.restApi}/idspace/${idSpaceInfo.id}`, idSpaceInfo)
      .pipe(
        map(this.mapIdSpaceInfo.bind(this))
      );
  }

  delete(id: string) {
    return this.http.delete(`${environment.restApi}/idspace/${id}`);
  }

  private mapIdSpaceInfo(idSpaceInfo: IdSpaceInfo): IdSpace {
    return {
      id: idSpaceInfo.id,
      name: idSpaceInfo.name
    };
  }

  private toIdSpaceInfo(idSpace: IdSpace): IdSpaceInfo {
    return {
      id: idSpace.id,
      name: idSpace.name
    };
  }

}
