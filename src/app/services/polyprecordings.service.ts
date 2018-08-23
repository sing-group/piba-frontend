import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import PolypRecording from '../models/PolypRecording';
import PolypRecordingInfo from './entities/PolypRecordingInfo';
import { environment } from '../../environments/environment';
import { PolypsService } from './polyps.service';
import { VideosService } from './videos.service';
import Polyp from '../models/Polyp';
import Video from '../models/Video';
import { concatMap } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { forkJoin } from 'rxjs/observable/forkJoin';
import PolypRecordingEditionInfo from './entities/PolypRecordingEditionInfo';

@Injectable()
export class PolypRecordingsService {

  constructor(private http: HttpClient,
    private polypsService: PolypsService,
    private videosService: VideosService) { }

  getPolypRecordings(video_id: string): Observable<PolypRecording[]> {
    let params = new HttpParams();
    params = params.append('id', video_id);

    return this.http.get<PolypRecordingInfo[]>(`${environment.restApi}/polyprecording`, { params }).pipe(
      concatMap((polypRecordingInfos) =>
        forkJoin(polypRecordingInfos.map(polypRecordingInfo =>
          forkJoin(
            this.videosService.getVideo(polypRecordingInfo.video.id),
            this.polypsService.getPolyp(polypRecordingInfo.polyp.id))

        ))
        , (polypRecordingInfos, videosAndPolyps) =>
          polypRecordingInfos.map((polypRecordingInfo, index) =>
            this.mapPolypRecordingInfo(polypRecordingInfo, videosAndPolyps[index][0], videosAndPolyps[index][1]))
      )
    );
  }

  private mapPolypRecordingInfo(polypRecordingInfo: PolypRecordingInfo, video: Video, polyp: Polyp): PolypRecording {
    return {
      video: video,
      polyp: polyp,
      start: polypRecordingInfo.start,
      end: polypRecordingInfo.end
    }
  }

  createPolypRecording(polypRecording: PolypRecording): Observable<PolypRecording> {
    let polypRecordingEditionInfo = this.toPolypRecordingEditionInfo(polypRecording);

    return this.http.post<PolypRecordingInfo>(`${environment.restApi}/polyprecording`, polypRecordingEditionInfo).pipe(
      concatMap((polypRecordingInfo) =>
          forkJoin(
            this.videosService.getVideo(polypRecordingInfo.video.id),
            this.polypsService.getPolyp(polypRecordingInfo.polyp.id))
        , (polypRecordingInfo, videoAndPolyp) =>
            this.mapPolypRecordingInfo(polypRecordingInfo, videoAndPolyp[0], videoAndPolyp[1])
      )
    );
  }

  private toPolypRecordingEditionInfo(polypRecording: PolypRecording): PolypRecordingEditionInfo {
    return {
      video: polypRecording.video.id,
      polyp: polypRecording.polyp.id,
      start: polypRecording.start,
      end: polypRecording.end
    };
  }

  removePolypRecording(polypRecording: PolypRecording){
    return this.http.delete(`${environment.restApi}/polyprecording/`+ polypRecording.video.id + '/' + polypRecording.polyp.id);
  }

}