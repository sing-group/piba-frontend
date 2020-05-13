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
import {forkJoin, Observable} from 'rxjs';
import {PolypRecording} from '../models/PolypRecording';
import {PolypRecordingInfo} from './entities/PolypRecordingInfo';
import {environment} from '../../environments/environment';
import {PolypsService} from './polyps.service';
import {VideosService} from './videos.service';
import {Polyp} from '../models/Polyp';
import {Video} from '../models/Video';
import {concatMap, map} from 'rxjs/operators';
import {IdAndUri} from './entities/IdAndUri';
import {OperatorFunction} from 'rxjs/internal/types';

@Injectable()
export class PolypRecordingsService {

  constructor(private http: HttpClient,
              private polypsService: PolypsService,
              private videosService: VideosService) {
  }

  public static mapPolypRecordingInfo(polypRecordingInfo: PolypRecordingInfo, video: Video, polyp: Polyp): PolypRecording {
    return {
      id: polypRecordingInfo.id,
      video: video,
      polyp: polyp,
      start: polypRecordingInfo.start,
      end: polypRecordingInfo.end,
      confirmed: polypRecordingInfo.confirmed
    };
  }

  fillMultiplePolypAndVideo(polypRecording: Observable<PolypRecordingInfo[]>): Observable<PolypRecording[]> {
    return polypRecording.pipe(
      this.createFillMultiplePolypAndVideoOperator()
    );
  }

  private createFillPolypAndVideoOperator():
    OperatorFunction<PolypRecordingInfo, PolypRecording> {
    return concatMap(polypRecordingInfo =>
      forkJoin(
        this.videosService.getVideo((<IdAndUri>polypRecordingInfo.video).id),
        this.polypsService.getPolyp((<IdAndUri>polypRecordingInfo.polyp).id)
      ).pipe(
        map(videoAndPolyp =>
          PolypRecordingsService.mapPolypRecordingInfo(polypRecordingInfo, videoAndPolyp[0], videoAndPolyp[1])
        )
      )
    );
  }

  private createFillMultiplePolypAndVideoOperator():
    OperatorFunction<PolypRecordingInfo[], PolypRecording[]> {
    return concatMap(polypRecordingInfos =>
      forkJoin(polypRecordingInfos.map(polypRecordingInfo =>
        forkJoin(
          this.videosService.getVideo((<IdAndUri>polypRecordingInfo.video).id),
          this.polypsService.getPolyp((<IdAndUri>polypRecordingInfo.polyp).id)
        )
      )).pipe(
        map(videoAndPolyps =>
          polypRecordingInfos.map((polypRecordingInfo, index) =>
            PolypRecordingsService.mapPolypRecordingInfo(polypRecordingInfo, videoAndPolyps[index][0], videoAndPolyps[index][1])
          )
        )
      )
    );
  }

  getPolypRecordingsByVideo(videoId: string): Observable<PolypRecording[]> {
    return this.http.get<PolypRecordingInfo[]>(`${environment.restApi}/polyprecording/video/${videoId}`)
      .pipe(this.createFillMultiplePolypAndVideoOperator());
  }

  getPolypRecordingsByPolyp(polypId: string): Observable<PolypRecording[]> {
    return this.http.get<PolypRecordingInfo[]>(`${environment.restApi}/polyprecording/polyp/${polypId}`)
      .pipe(this.createFillMultiplePolypAndVideoOperator());
  }

  addRecordingsToPolyps(polyps: Polyp[]): Observable<Polyp[]> {
    return forkJoin(
      polyps.map(polyp => this.getPolypRecordingsByPolyp(polyp.id))
    ).pipe(
      map(recordings => polyps.map((polyp, index) => {
        polyp.polypRecordings = recordings[index];
        return polyp;
      }))
    );
  }

  createPolypRecording(polypRecording: PolypRecording): Observable<PolypRecording> {
    const newPolypRecordingInfo = this.toPolypRecordingInfo(polypRecording);

    return this.http.post<PolypRecordingInfo>(`${environment.restApi}/polyprecording`, newPolypRecordingInfo)
      .pipe(this.createFillPolypAndVideoOperator());
  }

  removePolypRecording(polypRecording: PolypRecording | number) {
    const id = (typeof polypRecording === 'number') ? polypRecording : polypRecording.id;

    return this.http.delete(`${environment.restApi}/polyprecording/${id}`);
  }

  editPolypRecording(polypRecording: PolypRecording): Observable<PolypRecording> {
    const newPolypRecordingInfo = this.toPolypRecordingInfo(polypRecording);
    return this.http.put<PolypRecordingInfo>(`${environment.restApi}/polyprecording/${newPolypRecordingInfo.id}`, newPolypRecordingInfo)
      .pipe(this.createFillPolypAndVideoOperator());
  }

  editPolypRecordings(polypRecordings: PolypRecording[]): Observable<PolypRecording[]> {
    const newPolypRecordingsInfo: PolypRecordingInfo[] = polypRecordings.map(polypRecording => this.toPolypRecordingInfo(polypRecording));
    return this.http.put<PolypRecordingInfo[]>(`${environment.restApi}/polyprecording`, newPolypRecordingsInfo)
      .pipe(this.createFillMultiplePolypAndVideoOperator());
  }

  private toPolypRecordingInfo(polypRecording: PolypRecording): PolypRecordingInfo {
    return {
      id: polypRecording.id,
      video: polypRecording.video.id,
      polyp: polypRecording.polyp.id,
      start: polypRecording.start,
      end: polypRecording.end,
      confirmed: polypRecording.confirmed
    };
  }

}
