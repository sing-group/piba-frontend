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

@Injectable()
export class PolypRecordingsService {

  constructor(private http: HttpClient,
              private polypsService: PolypsService,
              private videosService: VideosService) {
  }

  getPolypRecordingsByVideo(video_id: string): Observable<PolypRecording[]> {
    return this.http.get<PolypRecordingInfo[]>(`${environment.restApi}/polyprecording/video/${video_id}`)
      .pipe(
        concatMap(polypRecordingInfos =>
          forkJoin(polypRecordingInfos.map(polypRecordingInfo =>
            forkJoin(
              this.videosService.getVideo((<IdAndUri>polypRecordingInfo.video).id),
              this.polypsService.getPolyp((<IdAndUri>polypRecordingInfo.polyp).id))
          )).pipe(
            map(videosAndPolyps =>
              polypRecordingInfos.map((polypRecordingInfo, index) =>
                this.mapPolypRecordingInfo(polypRecordingInfo, videosAndPolyps[index][0], videosAndPolyps[index][1]))
            )
          )
        )
      );
  }

  getPolypRecordingsByPolyp(polyp_id: string): Observable<PolypRecording[]> {
    return this.http.get<PolypRecordingInfo[]>(`${environment.restApi}/polyprecording/polyp/${polyp_id}`)
      .pipe(
        concatMap(polypRecordingInfos =>
          forkJoin(polypRecordingInfos.map(polypRecordingInfo =>
            forkJoin(
              this.videosService.getVideo((<IdAndUri>polypRecordingInfo.video).id),
              this.polypsService.getPolyp((<IdAndUri>polypRecordingInfo.polyp).id))
          )).pipe(
            map(videosAndPolyps =>
              polypRecordingInfos.map((polypRecordingInfo, index) =>
                this.mapPolypRecordingInfo(polypRecordingInfo, videosAndPolyps[index][0], videosAndPolyps[index][1]))
            )
          )
        )
      );
  }

  createPolypRecording(polypRecording: PolypRecording): Observable<PolypRecording> {
    const newPolypRecordingInfo = this.toPolypRecordingInfo(polypRecording);

    return this.http.post<PolypRecordingInfo>(`${environment.restApi}/polyprecording`, newPolypRecordingInfo)
      .pipe(
        concatMap((polypRecordingInfo) =>
          forkJoin(
            this.videosService.getVideo((<IdAndUri>polypRecordingInfo.video).id),
            this.polypsService.getPolyp((<IdAndUri>polypRecordingInfo.polyp).id)
          ).pipe(
            map(videoAndPolyp =>
              this.mapPolypRecordingInfo(polypRecordingInfo, videoAndPolyp[0], videoAndPolyp[1]
              )
            )
          )
        )
      );
  }

  removePolypRecording(polypRecording: PolypRecording) {
    return this.http.delete(`${environment.restApi}/polyprecording/` + polypRecording.id);
  }

  private mapPolypRecordingInfo(polypRecordingInfo: PolypRecordingInfo, video: Video, polyp: Polyp): PolypRecording {
    return {
      id: polypRecordingInfo.id,
      video: video,
      polyp: polyp,
      start: polypRecordingInfo.start,
      end: polypRecordingInfo.end
    };
  }

  private toPolypRecordingInfo(polypRecording: PolypRecording): PolypRecordingInfo {
    return {
      id: polypRecording.id,
      video: polypRecording.video.id,
      polyp: polypRecording.polyp.id,
      start: polypRecording.start,
      end: polypRecording.end
    };
  }

}
