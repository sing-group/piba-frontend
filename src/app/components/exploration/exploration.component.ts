import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Video from '../../models/Video';
import Polyp from '../../models/Polyp';
import Exploration from '../../models/Exploration';
import VideoUploadInfo from '../../services/entities/VideoUploadInfo';
import { VideosService } from '../../services/videos.service';
import { PolypsService } from '../../services/polyps.service';
import { ExplorationsService } from '../../services/explorations.service';

interface Ambit {
  name: string;
}

interface Histology {
  name: string;
}

@Component({
  selector: 'app-exploration',
  templateUrl: './exploration.component.html',
  styleUrls: ['./exploration.component.css']
})
export class ExplorationComponent implements OnInit {

  readonly POLLING_INTERVAL:number = 5000;

  polyps: Polyp[];
  exploration: Exploration = new Exploration();

  ambit: Ambit[];
  selectedAmbit: Ambit;

  histology: Histology[];
  selectedHistology: Histology[];

  videoHTML: HTMLMediaElement;
  controls: HTMLElement;

  newVideo: Video = new Video();

  userUploadingVideo: Boolean = false;

  constructor(
    private videosService: VideosService,
    private polypsService: PolypsService,
    private explorationsService: ExplorationsService,
    private route: ActivatedRoute
  ) {
    this.ambit = [{ name: 'Sergas' }];
    this.histology = [{ name: 'Histology 1' }];
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    this.polypsService.getPolyps().subscribe(polyps => this.polyps = polyps);

    this.explorationsService.getExploration(id).subscribe(exploration => {
      this.exploration = exploration;
      exploration.videos.filter((video) => video.isProcessing).forEach((processingVideo) => {
        this.pollProcessingVideo(processingVideo);
      });
    });
  }

  pollProcessingVideo(processingVideo: Video) {
      let videoPolling = this.videosService.getVideo(processingVideo.id, this.POLLING_INTERVAL).subscribe((video) => {
        this.exploration.videos.filter((currentVideo) => currentVideo.id == video.id).forEach((currentVideo) => {
          Object.assign(currentVideo, video);
        });
        if (!video.isProcessing) {
          videoPolling.unsubscribe();
        }
    });
  }

  playVideo(id) {
    this.videoHTML = document.getElementById(id) as HTMLMediaElement;
    this.videoHTML.play();
    this.controls = document.getElementById('controls-' + id);
    this.controls.style.display = 'none';
  }

  pauseVideo(id) {
    this.videoHTML = document.getElementById(id) as HTMLMediaElement;
    this.videoHTML.pause();
    this.controls = document.getElementById('controls-' + id);
    this.controls.style.display = 'flex';
  }

  uploadVideo() {
    let fileElement = document.getElementById("video-form-file") as HTMLInputElement;
    let file = fileElement.files[0];
    this.newVideo.exploration_id = this.exploration.id; 
    let videoUploadInfo = this.mapVideo(this.newVideo);
    videoUploadInfo.file = file;
    this.videosService
      .createVideo(videoUploadInfo).subscribe(video => {
        this.exploration.videos = this.exploration.videos.concat(video);
        if (video.isProcessing) {
          this.pollProcessingVideo(video);
        }
      });
    this.userUploadingVideo = false;
  }

  private mapVideo(video: Video): VideoUploadInfo {
    return {
      title: video.title,
      observations: video.observation,
      file: null,
      exploration_id: video.exploration_id
    }
  }
}
