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
import {HttpClient, HttpParams} from '@angular/common/http';
import {forkJoin, Observable, of} from 'rxjs';
import {Exploration} from '../models/Exploration';
import {Video} from '../models/Video';
import {Polyp} from '../models/Polyp';
import {ExplorationInfo} from './entities/ExplorationInfo';
import {environment} from '../../environments/environment';
import {concatMap, flatMap, map} from 'rxjs/operators';
import {VideosService} from './videos.service';
import {PolypsService} from './polyps.service';
import {PatientsService} from './patients.service';
import {IdAndUri} from './entities/IdAndUri';
import {Patient} from '../models/Patient';
import {PibaError} from '../modules/notification/entities';
import {IdSpace} from '../models/IdSpace';
import {ExplorationPage} from './entities/ExplorationPage';

@Injectable()
export class ExplorationsService {

  constructor(
    private http: HttpClient,
    private videosService: VideosService,
    private polypsService: PolypsService,
    private patientsService: PatientsService
  ) {
  }

  getExploration(uuid: string): Observable<Exploration> {
    return this.http.get<ExplorationInfo>(`${environment.restApi}/exploration/${uuid}`)
      .pipe(
        concatMap(explorationInfo => forkJoin(
          explorationInfo.videos.length === 0 ? of([]) :
            forkJoin(
              explorationInfo.videos.map(
                idAndUri => this.videosService.getVideo(idAndUri.id)
              )),
          explorationInfo.polyps.length === 0 ? of([]) :
            forkJoin(
              explorationInfo.polyps.map(
                idAndUri => this.polypsService.getPolyp(idAndUri.id)
              )
            ),
          this.patientsService.getPatient((<IdAndUri>explorationInfo.patient).id))
          .pipe(
            map(videosAndPolypsAndPatient => this.mapExplorationInfo(
              explorationInfo,
              videosAndPolypsAndPatient[0],
              videosAndPolypsAndPatient[1],
              videosAndPolypsAndPatient[2]
            ))
          )
        ),
        PibaError.throwOnError(
          'Error retrieving exploration',
          `Exploration ${uuid} could not be retrieved.`
        )
      );
  }

  getTotalExplorations(page: number, pageSize: number): Observable<ExplorationPage> {
    return this.getExplorations(page, pageSize, new HttpParams());
  }

  getExplorationsBy(patientID: string, idSpace: IdSpace, page: number, pageSize: number): Observable<ExplorationPage> {
    let params = new HttpParams();
    params = params.append('patient', patientID).append('idspace', idSpace.id);
    return this.getExplorations(page, pageSize, params)
      .pipe(
        PibaError.throwOnError(
          'Error retrieving explorations',
          `No explorations are found for that patient.`
        )
      );
  }

  addExplorationsToPolyps(polyps: Polyp[]): Observable<Polyp[]> {
    return forkJoin(
      polyps.map(polyp => {
        const explorationId = typeof polyp.exploration === 'string' ? polyp.exploration : polyp.exploration.id;
        return this.getExploration(explorationId);
      })
    ).pipe(
      map(explorations => polyps.map((polyp, index) => {
        polyp.exploration = explorations[index];
        return polyp;
      }))
    );
  }

  private getExplorations(page: number, pageSize: number, params: HttpParams): Observable<ExplorationPage> {
    params = params.append('page', page.toString()).append('pageSize', pageSize.toString());
    return this.http.get<ExplorationInfo[]>(`${environment.restApi}/exploration/`, {params, observe: 'response'}).pipe(
      concatMap(response => {
        return this.withPatient(of(response.body)
        ).pipe(
          map(explorationsWithPatient => {
            const explorationPage: ExplorationPage = {
              totalItems: Number(response.headers.get('X-Pagination-Total-Items')),
              explorations: explorationsWithPatient
            };
            return explorationPage;
          })
        );
      })
    );
  }

  private withPatient(explorationInfoObservable: Observable<ExplorationInfo[]>): Observable<Exploration[]> {
    return explorationInfoObservable.pipe(
      concatMap((explorationInfos) =>
        explorationInfos.length === 0 ? of([]) :
          forkJoin(
            explorationInfos.map(explorationInfo => this.patientsService.getPatient((<IdAndUri>explorationInfo.patient).id))
          ).pipe(
            map(patients =>
              explorationInfos.map((explorationInfo, index) =>
                this.mapOnlyExplorationInfo(explorationInfo, patients[index])
              )
            )
          )
      )
    );
  }

  createExploration(exploration: Exploration): Observable<Exploration> {
    const explorationInfo = this.toExplorationInfo(exploration);
    return this.http.post<ExplorationInfo>(`${environment.restApi}/exploration`, explorationInfo)
      .pipe(
        map(this.mapOnlyExplorationInfo.bind(this))
      );
  }

  editExploration(exploration: Exploration): Observable<Exploration> {
    const explorationInfo = this.toExplorationInfo(exploration);
    return this.http.put<ExplorationInfo>(`${environment.restApi}/exploration/${explorationInfo.id}`, explorationInfo)
      .pipe(
        map(this.mapOnlyExplorationInfo.bind(this))
      );
  }

  addPolypToExploration(newPolyp: Polyp, explorationUuid: string): Observable<Polyp> {
    return this.getExploration(explorationUuid)
      .pipe(
        flatMap(exploration => {
          newPolyp.exploration = exploration;
          return this.polypsService.createPolyp(newPolyp);
        })
      );
  }

  getPolyps(uuidOrExploration: string | Exploration): Observable<Polyp[]> {
    const uuid = typeof uuidOrExploration === 'string' ? uuidOrExploration : uuidOrExploration.id;
    return this.polypsService.getPolypsOfExploration(uuid);
  }

  delete(id: string) {
    return this.http.delete(`${environment.restApi}/exploration/` + id);
  }

  private mapExplorationInfo(explorationInfo: ExplorationInfo, videos: Video[], polyps: Polyp[], patient: Patient): Exploration {
    return {
      id: explorationInfo.id,
      title: explorationInfo.title,
      explorationDate: explorationInfo.explorationDate,
      location: explorationInfo.location,
      videos: videos,
      polyps: polyps,
      numVideos: explorationInfo.numVideos,
      numPolyps: explorationInfo.numPolyps,
      patient: patient,
      confirmed: explorationInfo.confirmed
    };
  }

  private mapOnlyExplorationInfo(explorationInfo: ExplorationInfo, patient: Patient): Exploration {
    return this.mapExplorationInfo(explorationInfo, [], [], patient);
  }

  private toExplorationInfo(exploration: Exploration): ExplorationInfo {
    return {
      id: exploration.id,
      title: exploration.title,
      explorationDate: exploration.explorationDate,
      location: exploration.location,
      patient: exploration.patient.id,
      confirmed: exploration.confirmed
    };
  }

}
