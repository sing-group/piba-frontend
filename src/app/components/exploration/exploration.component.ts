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
  editingVideo: string;
  deletingVideo = false;

  pollings: Subscription[] = [];

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
      this.exploration.polyps.forEach((polyp) => {
        polyp.exploration = exploration;
      });
    });
  }

  ngOnDestroy()  {
    this.pollings.forEach( (polling) => {
      polling.unsubscribe();
    });
  }

  pollProcessingVideo(processingVideo: Video) {
    const videoPolling = this.videosService.getVideo(processingVideo.id, this.POLLING_INTERVAL).subscribe((video) => {
      this.exploration.videos.filter((currentVideo) => currentVideo.id === video.id).forEach((currentVideo) => {
        Object.assign(currentVideo, video);
      });
      if (!video.isProcessing) {
        videoPolling.unsubscribe();
        this.pollings.splice(this.pollings.indexOf(videoPolling, 0), 1);
      }
    });
    this.pollings.push(videoPolling);
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
          this.exploration.videos = this.exploration.videos.concat(video);
          this.notificationService.success('Video is being processed..', 'Video uploaded');
          if (video.isProcessing) {
            this.pollProcessingVideo(video);
          }
          break;
      }
    });

    this.cancel();
  }

  cancel() {
    this.userUploadingVideo = false;
    this.video = new Video();
    this.deletingVideo = false;
    this.assignVideoName();
  }

  delete(id: string) {
    this.videosService.delete(id).subscribe(() => {
        const index = this.exploration.videos.indexOf(
          this.exploration.videos.find((video) => video.id === id
          )
        );
        this.exploration.videos.splice(index, 1);
        this.assignVideoName();
        this.notificationService.success('Video removed successfully.', 'Video removed.');
      }
    );
    this.cancel();
  }

  remove(id: string) {
    this.deletingVideo = true;
    this.video = this.exploration.videos.find((video) => video.id === id);
  }

  selectedVideo(video: Video) {
    this.editingVideo = video.id;
    this.isReadonly = false;
  }

  editVideo(video: Video) {
    const title = document.getElementsByClassName('title-' + video.id) as HTMLCollectionOf<HTMLInputElement>;
    const observations = document.getElementsByClassName('observations-' + video.id) as HTMLCollectionOf<HTMLInputElement>;
    const withText = document.getElementsByClassName('withText-' + video.id) as HTMLCollectionOf<HTMLInputElement>;
    video.title = title[0].value;
    video.observations = observations[0].value;
    video.withText = withText[0].checked;

    this.videosService.editVideo(video).subscribe(updatedVideo => {
      this.editingVideo = null;
      this.isReadonly = true;
      Object.assign(this.exploration.videos.find((v) =>
        v.id === video.id
      ), updatedVideo);
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
