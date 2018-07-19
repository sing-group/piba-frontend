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

  videos: Video[];
  polyps: Polyp[];
  exploration: Exploration = new Exploration();;

  ambit: Ambit[];
  selectedAmbit: Ambit;

  histology: Histology[];
  selectedHistology: Histology[];

  videoHTML: HTMLMediaElement;
  controls: HTMLElement;

  public newVideo: Video = new Video();

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

    this.videosService.getVideos().subscribe(videos => this.videos = videos);
    this.polypsService.getPolyps().subscribe(polyps => this.polyps = polyps);
    this.explorationsService.getExploration(id).subscribe(exploration => this.exploration = exploration);
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
    let videoUploadInfo = this.mapVideo(this.newVideo);
    videoUploadInfo.file = file;
    this.videosService
      .createVideo(videoUploadInfo).subscribe(video => this.videos = this.videos.concat(video));
    this.userUploadingVideo = false;
  }

  private mapVideo(video: Video): VideoUploadInfo {
    return {
      title: video.title,
      observations: video.observation,
      file: null
    }
  }
}
