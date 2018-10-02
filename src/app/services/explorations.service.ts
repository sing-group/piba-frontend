import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {forkJoin, Observable, of} from 'rxjs';

import {Exploration} from '../models/Exploration';
import {Video} from '../models/Video';
import {Polyp} from '../models/Polyp';
import {ExplorationInfo} from './entities/ExplorationInfo';
import {environment} from '../../environments/environment';
import {concatMap, map} from 'rxjs/operators';
import {VideosService} from './videos.service';
import {PolypsService} from './polyps.service';
import {PatientsService} from './patients.service';
import {IdAndUri} from './entities/IdAndUri';
import {Patient} from '../models/Patient';

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
          this.patientsService.getPatient((<IdAndUri>explorationInfo.patient).id)
          ).pipe(
          map(videosAndPolypsAndPatient => this.mapExplorationInfo(
            explorationInfo,
            videosAndPolypsAndPatient[0],
            videosAndPolypsAndPatient[1],
            videosAndPolypsAndPatient[2]
          ))
          )
        )
      );
  }

  getExplorations(): Observable<Exploration[]> {
    return this.http.get<ExplorationInfo[]>(`${environment.restApi}/exploration/`)
      .pipe(
        concatMap((explorationInfos) =>
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

  getPolyps(uuid: string): Observable<Polyp[]> {
    return this.polypsService.getPolypsOfExploration(uuid);
  }

  delete(id: string) {
    return this.http.delete(`${environment.restApi}/exploration/` + id);
  }

  private mapExplorationInfo(explorationInfo: ExplorationInfo, videos: Video[], polyps: Polyp[], patient: Patient): Exploration {
    return {
      id: explorationInfo.id,
      title: explorationInfo.title,
      date: explorationInfo.date,
      location: explorationInfo.location,
      videos: videos,
      polyps: polyps,
      patient: patient
    };
  }

  private mapOnlyExplorationInfo(explorationInfo: ExplorationInfo, patient: Patient): Exploration {
    return this.mapExplorationInfo(explorationInfo, [], [], patient);
  }

  private toExplorationInfo(exploration: Exploration): ExplorationInfo {
    return {
      id: exploration.id,
      title: exploration.title,
      date: exploration.date,
      location: exploration.location,
      patient: exploration.patient.id
    };
  }

}
