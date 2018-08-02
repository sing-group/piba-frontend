import { Component, OnInit } from '@angular/core';
import Polyp, { WASP, NICE, LST, PARIS } from '../../models/Polyp';
import { PolypsService } from '../../services/polyps.service';
import Exploration from '../../models/Exploration';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-polyp',
  templateUrl: './polyp.component.html',
  styleUrls: ['./polyp.component.css']
})
export class PolypComponent implements OnInit {

  polyps: Polyp[];
  exploration: Exploration;

  WASP = WASP;
  WASPValues: WASP[];

  NICE = NICE;
  NICEValues: NICE[];

  LST = LST;
  LSTValues: LST[];

  PARIS = PARIS;
  PARISValues: PARIS[];

  creatingPolyp: Boolean = false;
  editingPolyp: Boolean = false;

  polyp: Polyp = new Polyp();

  constructor(private polypsService: PolypsService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.WASPValues = this.enumKeys(WASP);
    this.NICEValues = this.enumKeys(NICE);
    this.LSTValues = this.enumKeys(LST);
    this.PARISValues = this.enumKeys(PARIS);
    this.polypsService.getPolyps().subscribe(polyps => this.polyps = polyps);
  }

  cancel() {
    this.creatingPolyp = false;
    this.editingPolyp = false;
  }
  save() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!this.editingPolyp) {
      this.polyp.exploration = this.exploration.id;
      this.polypsService.createPolyp(this.polyp).subscribe(newPolyp => this.polyps.concat(newPolyp));
    };
    this.cancel();
  }

  private enumKeys<T>(enumType: any): T[] {
    return <T[]>(<any>Object.keys(enumType));
  }
}


