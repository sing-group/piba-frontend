import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Polyp, {WASP, NICE, LST, PARIS} from '../../models/Polyp';
import Video from '../../models/Video';
import { VideosService } from '../../services/videos.service';
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
    private route: ActivatedRoute,
    private timePipe: TimePipe
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    this.videosService.getVideo(id)
      .subscribe(video => this.video = video);
  }

  startVideo() {
    this.initial = this.timePipe.transform(this.currentTime);
  }

  finalVideo() {
    this.final = this.timePipe.transform(this.currentTime);
  }
  
  

  onCurrentTimeUpdate(time: number) {
    this.currentTime = time;
  }
}
