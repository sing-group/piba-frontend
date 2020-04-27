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
import {VideoModification} from '../models/VideoModification';
import {forkJoin, Observable} from 'rxjs';
import {VideoModificationInfo} from './entities/VideoModificationInfo';
import {environment} from '../../environments/environment';
import {concatMap, map} from 'rxjs/operators';
import {ModifiersService} from './modifiers.service';
import {VideosService} from './videos.service';
import {IdAndUri} from './entities/IdAndUri';
import {Modifier} from '../models/Modifier';
import {Video} from '../models/Video';

@Injectable({
  providedIn: 'root'
})
export class VideoModificationsService {

  constructor(private http: HttpClient, private modifiersService: ModifiersService, private videosService: VideosService) {
  }

  createVideoModification(videoModification: VideoModification): Observable<VideoModification> {
    const newVideoModificationInfo = this.toVideoModificationInfo(videoModification);

    return this.http.post<VideoModificationInfo>(`${environment.restApi}/videomodification`, newVideoModificationInfo)
      .pipe(
        concatMap((videoModificationInfo) =>
          forkJoin(
            this.videosService.getVideo((<IdAndUri>videoModificationInfo.video).id),
            this.modifiersService.getModifier((<IdAndUri>videoModificationInfo.modifier).id)
          ).pipe(
            map(videoAndModifier =>
              this.mapVideoModificationInfo(videoModificationInfo, videoAndModifier[0], videoAndModifier[1]
              )
            )
          )
        )
      );
  }

  getVideoModifications(video_id: string): Observable<VideoModification[]> {
    let params = new HttpParams();
    params = params.append('id', video_id);

    return this.http.get<VideoModificationInfo[]>(`${environment.restApi}/videomodification`, {params})
      .pipe(
        concatMap(videoModificationInfos =>
          forkJoin(videoModificationInfos.map(videoModificationInfo =>
            forkJoin(
              this.videosService.getVideo((<IdAndUri>videoModificationInfo.video).id),
              this.modifiersService.getModifier((<IdAndUri>videoModificationInfo.modifier).id))
          )).pipe(
            map(videosAndModifiers =>
              videoModificationInfos.map((videoModificationInfo, index) =>
                this.mapVideoModificationInfo(videoModificationInfo, videosAndModifiers[index][0], videosAndModifiers[index][1]))
            )
          )
        )
      );
  }

  removeVideoModification(id: number) {
    return this.http.delete(`${environment.restApi}/videomodification/${id}`);
  }

  editVideoModification(videoModification: VideoModification): Observable<VideoModification> {
    const newVideoModificationInfo = this.toVideoModificationInfo(videoModification);
    return this.http.put<VideoModificationInfo>(`${environment.restApi}/videomodification/${newVideoModificationInfo.id}`,
      newVideoModificationInfo)
      .pipe(
        concatMap((videoModificationInfo) =>
          forkJoin(
            this.videosService.getVideo((<IdAndUri>videoModificationInfo.video).id),
            this.modifiersService.getModifier((<IdAndUri>videoModificationInfo.modifier).id)
          ).pipe(
            map(videoAndModifier =>
              this.mapVideoModificationInfo(videoModificationInfo, videoAndModifier[0], videoAndModifier[1]
              )
            )
          )
        )
      );
  }

  editVideoModifications(modifications: VideoModification[]): Observable<VideoModification[]> {
    const modificationsInfo: VideoModificationInfo[] = modifications.map(modification => this.toVideoModificationInfo(modification));

    return this.http.put<VideoModificationInfo[]>(`${environment.restApi}/videomodification`, modificationsInfo).pipe(
      concatMap(videoModificationInfos =>
        forkJoin(videoModificationInfos.map(videoModificationInfo =>
          forkJoin(
            this.videosService.getVideo((<IdAndUri>videoModificationInfo.video).id),
            this.modifiersService.getModifier((<IdAndUri>videoModificationInfo.modifier).id))
        )).pipe(
          map(videosAndModifiers =>
            videoModificationInfos.map((videoModificationInfo, index) =>
              this.mapVideoModificationInfo(videoModificationInfo, videosAndModifiers[index][0], videosAndModifiers[index][1]))
          )
        )
      )
    );
  }

  private toVideoModificationInfo(videoModification: VideoModification): VideoModificationInfo {
    return {
      id: videoModification.id,
      video: videoModification.video.id,
      modifier: videoModification.modifier.id,
      start: videoModification.start,
      end: videoModification.end,
      confirmed: videoModification.confirmed
    };
  }

  private mapVideoModificationInfo(videoModificationInfo: VideoModificationInfo, video: Video, modifier: Modifier): VideoModification {
    return {
      id: videoModificationInfo.id,
      video: video,
      modifier: modifier,
      start: videoModificationInfo.start,
      end: videoModificationInfo.end,
      confirmed: videoModificationInfo.confirmed
    };
  }
}
