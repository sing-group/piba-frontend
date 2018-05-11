import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Polyp } from '../../models/polyp';
import { Video } from '../../models/video';
import { VideosService } from '../../services/videos.service';
import { PolypsService } from '../../services/polyps.service';

declare function createControls(): void;

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit {
  selectedPolyp: Polyp;

  video: Video;

  initial: string;
  final: string;

  display: boolean;

  newPolyp: Polyp;

  constructor(
    private videosService: VideosService,
    private polypsService: PolypsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.display = false;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    this.videosService.getVideo(id)
      .subscribe(video => this.video = video);

    createControls();
  }

  startVideo() {
    this.initial = document.getElementById('timer').firstChild.textContent;
  }

  finalVideo() {
    this.final = document.getElementById('timer').firstChild.textContent;
  }

  showDialog() {
    this.display = true;
  }

  addPolyp(videoId) {
    this.videosService.addPolyp(this.video.id, {
      id: 'ee0d66af-f3fb-4d7d-85f8-456d5dc14bb5',
      name: 'Polyp 2',
      size: 11,
      location: 'left colon',
      wasp: 'Type I',
      nice: '1',
      lst: '1',
      paris: 'Category 0-1',
      histology: 'Histology',
      videos: [this.video]
    })
    .subscribe(video => this.video = video);
  }

}
