import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Polyp, {WASP, NICE, LST, PARIS} from '../../models/Polyp';
import Video from '../../models/Video';
import { VideosService } from '../../services/videos.service';
import { PolypsService } from '../../services/polyps.service';
import { TimePipe } from '../../pipes/time.pipe';

@Component({
  selector: 'app-video-editor',
  templateUrl: './video-editor.component.html',
  styleUrls: ['./video-editor.component.css']
})
export class VideoEditorComponent implements OnInit {
  selectedPolyp: Polyp;
  polyps: Polyp[];

  video: Video;

  initial: String;
  final: String;

  newPolyp: Polyp;

  currentTime: number;

  modalOpened = false;

  constructor(
    private videosService: VideosService,
    private polypsService: PolypsService,
    private route: ActivatedRoute,
    private timePipe: TimePipe
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    this.videosService.getVideo(id)
      .subscribe(video => this.video = video);

    this.polypsService.getPolyps().subscribe(polyps => this.polyps = polyps);
  }

  startVideo() {
    this.initial = this.timePipe.transform(this.currentTime);
  }

  finalVideo() {
    this.final = this.timePipe.transform(this.currentTime);
  }
  
  addPolyp(videoId) {
    this.videosService.addPolyp(this.video.id, {
      id: 'ee0d66af-f3fb-4d7d-85f8-456d5dc14bb5',
      name: 'Polyp 2',
      size: 11,
      location: 'Left colon',
      wasp: WASP.ADENOMA,
      nice: NICE.TYPE_3,
      lst: LST.PSEUDODEPRESSED,
      paris: PARIS.SESSILE_DEPRESSED,
      histology: 'Histology',
      videos: [this.video],
      exploration: this.video.exploration_id
    })
      .subscribe(video => this.video = video);
  }
  

  onCurrentTimeUpdate(time: number) {
    this.currentTime = time;
  }
}
