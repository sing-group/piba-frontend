import { Component, OnInit, Input } from '@angular/core';
import Polyp, { WASP, NICE, LST, PARIS } from '../../models/Polyp';
import { PolypsService } from '../../services/polyps.service';
import Exploration from '../../models/Exploration';

@Component({
  selector: 'app-polyp',
  templateUrl: './polyp.component.html',
  styleUrls: ['./polyp.component.css']
})
export class PolypComponent implements OnInit {

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

  @Input() exploration: Exploration;

  constructor(private polypsService: PolypsService) { }

  ngOnInit() {
    this.WASPValues = this.enumValues(WASP);
    this.NICEValues = this.enumValues(NICE);
    this.LSTValues = this.enumValues(LST);
    this.PARISValues = this.enumValues(PARIS);
  }

  private enumValues<T>(enumType: any): T[] {
    return <T[]>(<any>Object.keys(enumType)).map((key: string) => enumType[key]);
  }

  cancel() {
    this.creatingPolyp = false;
    this.editingPolyp = false;
    this.polyp = new Polyp();
  }

  save() {
    if (!this.editingPolyp) {
      this.polyp.exploration = this.exploration;
      this.polypsService.createPolyp(this.polyp).subscribe(newPolyp => this.exploration.polyps = this.exploration.polyps.concat(newPolyp));
    } else {
      this.polypsService.editPolyp(this.polyp).subscribe(updatedPolyp => {
        Object.assign(this.exploration.polyps.find((polyp) =>
          polyp.id == this.polyp.id
        ), updatedPolyp)
      });
    }
    this.cancel();
  }

  editPolyp(id: string) {
    this.editingPolyp = true;
    this.polyp = this.exploration.polyps.find(polyp => polyp.id == id);
  }

  delete(id: string) {
    this.polypsService.delete(id).subscribe(() => {
      let index = this.exploration.polyps.indexOf(
        this.exploration.polyps.find((polyp) => polyp.id == id
        )
      )
      this.exploration.polyps.splice(index, 1);
    }
    );
  }

}


