import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Video} from '../../models/Video';
import {Exploration} from '../../models/Exploration';
import {VideoUploadInfo} from '../../services/entities/VideoUploadInfo';
import {VideosService} from '../../services/videos.service';
import {ExplorationsService} from '../../services/explorations.service';
import {NotificationService} from '../../modules/notification/services/notification.service';


@Component({
  selector: 'app-exploration',
  templateUrl: './exploration.component.html',
  styleUrls: ['./exploration.component.css']
})
export class ExplorationComponent implements OnInit {

  readonly POLLING_INTERVAL: number = 5000;

  exploration: Exploration = null;

  newVideo: Video = new Video();

  userUploadingVideo: Boolean = false;

  isReadonly: Boolean = true;

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

  pollProcessingVideo(processingVideo: Video) {
    const videoPolling = this.videosService.getVideo(processingVideo.id, this.POLLING_INTERVAL).subscribe((video) => {
      this.exploration.videos.filter((currentVideo) => currentVideo.id === video.id).forEach((currentVideo) => {
        Object.assign(currentVideo, video);
      });
      if (!video.isProcessing) {
        videoPolling.unsubscribe();
      }
    });
  }

  uploadVideo() {
    const fileElement = document.getElementById('video-form-file') as HTMLInputElement;
    const file = fileElement.files[0];
    this.newVideo.exploration = this.exploration.id;
    const videoUploadInfo = this.mapVideo(this.newVideo);
    videoUploadInfo.file = file;
    this.videosService
      .createVideo(videoUploadInfo).subscribe(video => {
      this.exploration.videos = this.exploration.videos.concat(video);
      this.assignVideoName();
      this.notificationService.success('Video is being processed..', 'Video uploaded');
      if (video.isProcessing) {
        this.pollProcessingVideo(video);
      }
    });
    this.cancel();
  }

  cancel() {
    this.userUploadingVideo = false;
    this.newVideo = new Video();
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
  }

  editVideo(video: Video) {
    const title = document.getElementsByClassName('title-' + video.id) as HTMLCollectionOf<HTMLInputElement>;
    const observations = document.getElementsByClassName('observations-' + video.id) as HTMLCollectionOf<HTMLInputElement>;
    video.title = title[0].value;
    video.observations = observations[0].value;

    this.videosService.editVideo(video).subscribe(updatedVideo => {
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
      exploration: video.exploration
    };
  }

  private assignVideoName() {
    this.newVideo.title = 'Video ' + (this.exploration.videos.length + 1);
  }
}
