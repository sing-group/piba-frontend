import { Component, OnInit } from '@angular/core';
import { Video } from '../model/video';
import { VIDEOS } from '../mock-videos';
import { Polyp } from '../model/polyp';
import { POLYPS } from '../mock-polyp';

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

  videos = VIDEOS;
  polyps = POLYPS;

  ambit: Ambit[];
  selectedAmbit: Ambit;

  histology: Histology[];
  selectedHistology: Histology[];

  constructor() {
    this.ambit = [{ name: 'Sergas' }];
    this.histology = [{name: 'histology 1'}];
  }

  ngOnInit() {
  }

}
