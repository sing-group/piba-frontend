import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Video} from '../../models/Video';
import {Exploration} from '../../models/Exploration';
import {VideoUploadInfo} from '../../services/entities/VideoUploadInfo';
import {VideosService} from '../../services/videos.service';
import {ExplorationsService} from '../../services/explorations.service';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {Subscription} from 'rxjs';
import {HttpEventType} from '@angular/common/http';

@Component({
  selector: 'app-exploration',
  templateUrl: './exploration.component.html',
  styleUrls: ['./exploration.component.css']
})
export class ExplorationComponent implements OnInit, OnDestroy {

  readonly POLLING_INTERVAL: number = 5000;

  exploration: Exploration = null;

  video: Video = new Video();

  userUploadingVideo: false;
  uploadingVideo: false;
  progress = 0;
  uploadTimeRemaining = 0;
  uploadSpeed = 0;

  isReadonly = true;
  editingVideo: string = null;
  deletingVideo = false;

  pollings: Subscription[] = [];

  videoClones: Video[] = [];

  constructor(
    private videosService: VideosService,
    private explorationsService: ExplorationsService,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    this.explorationsService.getExploration(id).subscribe(exploration => {
      this.exploration = exploration;
      this.assignVideoName();
      exploration.videos.filter((video) => video.isProcessing).forEach((processingVideo) => {
        this.pollProcessingVideo(processingVideo);
      });
      exploration.videos.forEach((video) => {
        this.videoClones.push({...video});
      });
      this.exploration.polyps.forEach((polyp) => {
        polyp.exploration = exploration;
      });
    });
  }

  ngOnDestroy() {
    this.pollings.forEach((polling) => {
      polling.unsubscribe();
    });
  }

  pollProcessingVideo(processingVideo: Video) {
    const videoPolling = this.videosService.getVideo(processingVideo.id, this.POLLING_INTERVAL).subscribe((video) => {
      this.updateVideo(this.exploration.videos, video);
      this.updateVideo(this.videoClones, video);
      if (!video.isProcessing) {
        videoPolling.unsubscribe();
        this.pollings.splice(this.pollings.indexOf(videoPolling, 0), 1);
      }
    });
    this.pollings.push(videoPolling);
  }

  private updateVideo(list: Video[], video: Video) {
    list.filter((currentVideo) => currentVideo.id === video.id).forEach((currentVideo) => {
      Object.assign(currentVideo, video);
    });
  }

  uploadVideo() {
    const fileElement = document.getElementById('video-form-file') as HTMLInputElement;
    const file = fileElement.files[0];
    this.video.exploration = this.exploration.id;
    const videoUploadInfo = this.mapVideo(this.video);
    videoUploadInfo.file = file;
    let startTime = Date.now();

    this.videosService
      .createVideo(videoUploadInfo).subscribe(event => {
      switch (event.type) {
        case HttpEventType.Sent:
          startTime = Date.now();
          break;
        case HttpEventType.UploadProgress:
          if (event.total) {
            this.progress = Math.round(event.loaded / event.total * 100);
            const timeElapsed = Date.now() - startTime;
            const uploadSpeed = event.loaded / (timeElapsed / 1000);
            this.uploadTimeRemaining = Math.ceil(
              (event.total - event.loaded) / uploadSpeed
            );
            this.uploadSpeed = uploadSpeed / 1024 / 1024;
          }
          break;
        case HttpEventType.Response:
          this.progress = 0;
          this.uploadingVideo = false;
          const video = this.videosService.getMapVideoInfo(event.body);
          this.exploration.videos.push(video);
          this.videoClones.push({...video});
          this.notificationService.success('Video is being processed.', 'Video uploaded');
          if (video.isProcessing) {
            this.pollProcessingVideo(video);
          }
          this.cancel();
          break;
      }
    });
  }

  cancel() {
    this.userUploadingVideo = false;
    this.video = new Video();
    this.deletingVideo = false;
    this.assignVideoName();
  }

  selectedVideoToRemove(id: string) {
    this.deletingVideo = true;
    this.video = {...this.findIn(this.exploration.videos, id)};
  }

  delete(id: string) {
    this.videosService.delete(id).subscribe(() => {
        this.exploration.videos.splice(this.getIndexIn(this.exploration.videos, id), 1);
        this.videoClones.splice(this.getIndexIn(this.videoClones, id), 1);
        this.notificationService.success('Video removed successfully.', 'Video removed.');
        this.cancel();
      }
    );
  }

  private getIndexIn(list: Video[], id: string): number {
    return list.indexOf(
      this.findIn(list, id)
    );
  }

  private findIn(list: Video[], id: string): Video {
    return list.find((video) => video.id === id);
  }

  selectedVideoToEdit(video: Video) {
    if (this.editingVideo != null) {
      Object.assign(this.findIn(this.videoClones, this.editingVideo), this.findIn(this.exploration.videos, this.editingVideo));
    }
    this.editingVideo = video.id;
    this.isReadonly = false;
  }

  editVideo(video: Video) {
    this.videosService.editVideo(video).subscribe(updatedVideo => {
      this.editingVideo = null;
      this.isReadonly = true;
      Object.assign(this.findIn(this.exploration.videos, video.id), updatedVideo);
      this.notificationService.success('Video edited successfully.', 'Video edited.');
    });
  }

  private mapVideo(video: Video): VideoUploadInfo {
    if (video.observations === undefined) {
      video.observations = '';
    }
    return {
      title: video.title,
      observations: video.observations,
      file: null,
      withText: String(video.withText),
      exploration: video.exploration
    };
  }

  private assignVideoName() {
    this.video.title = 'Video ' + (this.exploration.videos.length + 1);
  }
}
