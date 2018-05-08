import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { POLYPS } from '../mock-polyp';
import { Polyp } from '../model/polyp';
import { VIDEOS } from '../mock-videos';
import { Video } from '../model/video';

declare function createControls(): void;

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit {

  polyps = POLYPS;
  selectedPolyp: Polyp;

  video: Video;

  initial: string;
  final: string;

  display: boolean = false;

  newPolyp: Polyp;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    let id = this.route.snapshot.paramMap.get('id');
    this.video = VIDEOS.find(item => item.id == +id);
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

  getVideoPolyps(id) {
    return VIDEOS.find(item => item.id == +id).polyps;
  }

  addPolyp(videoId) {
    VIDEOS.find(item => item.id == +videoId).polyps.push({
      id: 2, name: 'polyp 2', size: 11, location: 'left colon', wasp: 'Type I', nice: '1', lst: '1', paris: 'Category 0-1', histology: 'histology', videos: []
    });
  }

}
