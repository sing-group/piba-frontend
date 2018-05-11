import { Component, OnInit } from '@angular/core';
import { Video } from '../../models/video';
import { Polyp } from '../../models/polyp';
import { VideosService } from '../../services/videos.service';
import { PolypsService } from '../../services/polyps.service';

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

  ambit: Ambit[];
  selectedAmbit: Ambit;

  histology: Histology[];
  selectedHistology: Histology[];

  constructor(
    private videosService: VideosService,
    private polypsService: PolypsService
  ) {
    this.ambit = [{ name: 'Sergas' }];
    this.histology = [{name: 'histology 1'}];
  }

  ngOnInit() {
    this.videosService.getVideos().subscribe(videos => this.videos = videos);
    this.polypsService.getPolyps().subscribe(polyps => this.polyps = polyps);
  }

}
