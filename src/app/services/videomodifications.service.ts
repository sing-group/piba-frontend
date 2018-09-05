import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {VideoModification} from '../models/VideoModification';
import {forkJoin, Observable} from 'rxjs';
import {VideoModificationInfo} from './entities/VideoModificationInfo';
import {environment} from '../../environments/environment';
import {concatMap, map} from 'rxjs/operators';
import {ModifiersService} from './modifiers.service';
import {VideosService} from './videos.service';
import IdAndUri from './entities/IdAndUri';
import {Modifier} from '../models/Modifier';
import Video from '../models/Video';

@Injectable({
  providedIn: 'root'
})
export class VideomodificationsService {

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

  private toVideoModificationInfo(videoModification: VideoModification): VideoModificationInfo {
    return {
      video: videoModification.video.id,
      modifier: videoModification.modifier.id,
      start: videoModification.start,
      end: videoModification.end
    };
  }

  private mapVideoModificationInfo(videoModificationInfo: VideoModificationInfo, video: Video, modifier: Modifier): VideoModification {
    return {
      video: video,
      modifier: modifier,
      start: videoModificationInfo.start,
      end: videoModificationInfo.end
    };
  }
}
