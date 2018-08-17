import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Polyp from '../../models/Polyp';
import Video from '../../models/Video';
import { VideosService } from '../../services/videos.service';
import { TimePipe } from '../../pipes/time.pipe';
import { PolypsService } from '../../services/polyps.service';
import { ExplorationsService } from '../../services/explorations.service';
import { PolypRecordingsService } from '../../services/polyprecordings.service';

@Component({
  selector: 'app-video-editor',
  templateUrl: './video-editor.component.html',
  styleUrls: ['./video-editor.component.css']
})
export class VideoEditorComponent implements OnInit {

  video: Video;

  initial: String;
  final: String;

  newPolyp: Polyp = new Polyp();
  polyps: Polyp[];
  selectedPolyp: Polyp;

  currentTime: number;

  modalOpened = false;

  constructor(
    private videosService: VideosService,
    private route: ActivatedRoute,
    private timePipe: TimePipe,
    private polysService: PolypsService,
    private explorationsService: ExplorationsService,
    private polypRecordingsService: PolypRecordingsService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    this.videosService.getVideo(id)
      .subscribe(video => {
        this.video = video;
        this.explorationsService.getPolyps(this.video.exploration_id).subscribe(polyps => this.polyps = polyps);
        this.polypRecordingsService.getPolypRecordings(video.id).subscribe(polypRecordings => {
          this.video.polypRecording = polypRecordings;
        }
        );
      });
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

  addPolyp() {
    this.explorationsService.getExploration(this.video.exploration_id).subscribe(exploration => {
      this.newPolyp.exploration = exploration;
      this.polysService.createPolyp(this.newPolyp).subscribe(polyp => this.polyps.push(polyp));
    });
    this.modalOpened = false;
  }
}
