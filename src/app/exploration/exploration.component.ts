import { Component, OnInit } from '@angular/core';
import { Video } from '../model/video';
import { VIDEOS } from '../mock-videos';

interface Ambit {
  name: string;
}

@Component({
  selector: 'app-exploration',
  templateUrl: './exploration.component.html',
  styleUrls: ['./exploration.component.css']
})
export class ExplorationComponent implements OnInit {

  videos = VIDEOS;

  ambit: Ambit[];

  selectedAmbit: Ambit;

  constructor() {
    this.ambit = [{ name: 'Sergas' }];
  }

  ngOnInit() {
  }

}
