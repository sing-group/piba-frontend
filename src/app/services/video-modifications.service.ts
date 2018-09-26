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

  private toVideoModificationInfo(videoModification: VideoModification): VideoModificationInfo {
    return {
      id: videoModification.id,
      video: videoModification.video.id,
      modifier: videoModification.modifier.id,
      start: videoModification.start,
      end: videoModification.end
    };
  }

  private mapVideoModificationInfo(videoModificationInfo: VideoModificationInfo, video: Video, modifier: Modifier): VideoModification {
    return {
      id: videoModificationInfo.id,
      video: video,
      modifier: modifier,
      start: videoModificationInfo.start,
      end: videoModificationInfo.end
    };
  }
}
