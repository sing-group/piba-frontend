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
import {forkJoin, Observable, OperatorFunction} from 'rxjs';
import {VideoModificationInfo} from './entities/VideoModificationInfo';
import {environment} from '../../environments/environment';
import {concatMap, map} from 'rxjs/operators';
import {ModifiersService} from './modifiers.service';
import {VideosService} from './videos.service';
import {IdAndUri} from './entities/IdAndUri';
import {Modifier} from '../models/Modifier';
import {Video} from '../models/Video';
import {PibaError} from '../modules/notification/entities';
import {CollectionUtils} from '../utils/collection.utils';

@Injectable({
  providedIn: 'root'
})
export class VideoModificationsService {

  constructor(
    private readonly http: HttpClient,
    private readonly modifiersService: ModifiersService,
    private readonly videosService: VideosService
  ) {
  }

  private static toVideoModificationInfo(videoModification: VideoModification): VideoModificationInfo {
    return {
      id: videoModification.id,
      video: videoModification.video.id,
      modifier: videoModification.modifier.id,
      start: videoModification.start,
      end: videoModification.end,
      confirmed: videoModification.confirmed
    };
  }

  private static mapVideoModificationInfo(
    videoModificationInfo: VideoModificationInfo, video: Video, modifier: Modifier
  ): VideoModification {
    return {
      id: videoModificationInfo.id,
      video: video,
      modifier: modifier,
      start: videoModificationInfo.start,
      end: videoModificationInfo.end,
      confirmed: videoModificationInfo.confirmed
    };
  }

  private createFillVideoModificationOperation(): OperatorFunction<VideoModificationInfo, VideoModification> {
    return concatMap((videoModificationInfo: VideoModificationInfo) =>
      forkJoin(
        this.videosService.getVideo((<IdAndUri>videoModificationInfo.video).id),
        this.modifiersService.getModifier((<IdAndUri>videoModificationInfo.modifier).id)
      ).pipe(
        map(videoAndModifier =>
          VideoModificationsService.mapVideoModificationInfo(
            videoModificationInfo, videoAndModifier[0], videoAndModifier[1]
          )
        )
      )
    );
  }

  private createFillMultipleVideoModificationOperation(videoId?: string): OperatorFunction<VideoModificationInfo[], VideoModification[]> {
    let listVideos: (modifications: VideoModificationInfo[]) => Observable<Video[]>;
    if (videoId !== null && videoId !== undefined) {
      listVideos = () => forkJoin(this.videosService.getVideo(videoId));
    } else {
      listVideos = videoModificationInfos => {
        const videoIds = CollectionUtils.mapToUniques(
          videoModificationInfos,
          info => (info.video as IdAndUri).id
        );

        return forkJoin(videoIds.map(id => this.videosService.getVideo(id)));
      };
    }

    return concatMap(videoModificationInfos => {
      const modifierIds = CollectionUtils.mapToUniques(
        videoModificationInfos,
        info => (info.modifier as IdAndUri).id
      );

      return forkJoin(
        listVideos(videoModificationInfos),
        forkJoin(modifierIds.map(modifierId => this.modifiersService.getModifier(modifierId)))
      ).pipe(
        map(videosAndModifiers => videoModificationInfos.map(videoModificationInfo => {
          return VideoModificationsService.mapVideoModificationInfo(
            videoModificationInfo,
            videosAndModifiers[0].find(video => video.id === (videoModificationInfo.video as IdAndUri).id),
            videosAndModifiers[1].find(modifier => modifier.id === (videoModificationInfo.modifier as IdAndUri).id));
        }))
      );
    });
  }

  createVideoModification(videoModification: VideoModification): Observable<VideoModification> {
    const newVideoModificationInfo = VideoModificationsService.toVideoModificationInfo(videoModification);

    return this.http.post<VideoModificationInfo>(`${environment.restApi}/videomodification`, newVideoModificationInfo)
      .pipe(
        this.createFillVideoModificationOperation(),
        PibaError.throwOnError(
          'Error creating video modification',
          'Video modification could not be created.'
        )
      );
  }

  listVideoModifications(videoId: string): Observable<VideoModification[]> {
    let params = new HttpParams();
    params = params.append('id', videoId);

    return this.http.get<VideoModificationInfo[]>(`${environment.restApi}/videomodification`, {params})
      .pipe(
        this.createFillMultipleVideoModificationOperation(videoId),
        PibaError.throwOnError(
          'Error listing video modifications',
          `Video modifications of video '${videoId}' could not be created.`
        )
      );
  }

  removeVideoModification(id: number) {
    return this.http.delete(`${environment.restApi}/videomodification/${id}`)
      .pipe(
        PibaError.throwOnError(
          'Error removing video modification',
          `Video modification '${id}' could not be removed.`
        )
      );
  }

  editVideoModification(videoModification: VideoModification): Observable<VideoModification> {
    const newVideoModificationInfo = VideoModificationsService.toVideoModificationInfo(videoModification);
    return this.http.put<VideoModificationInfo>(`${environment.restApi}/videomodification/${newVideoModificationInfo.id}`,
      newVideoModificationInfo)
      .pipe(
        this.createFillVideoModificationOperation(),
        PibaError.throwOnError(
          'Error modifying video modification',
          `Video modification '${videoModification.id}' could not be modified.`
        )
      );
  }

  editVideoModifications(modifications: VideoModification[]): Observable<VideoModification[]> {
    const modificationsInfo: VideoModificationInfo[] = modifications.map(
      VideoModificationsService.toVideoModificationInfo
    );

    return this.http.put<VideoModificationInfo[]>(`${environment.restApi}/videomodification`, modificationsInfo).pipe(
      this.createFillMultipleVideoModificationOperation(),
      PibaError.throwOnError(
        'Error modifying multiple video modification',
        `Video modifications could not be modified.`
      )
    );
  }
}
