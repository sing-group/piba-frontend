/*
 *  PIBA Frontend
 *
 * Copyright (C) 2018-2020 - Miguel Reboiro-Jato,
 * Daniel Glez-Peña, Alba Nogueira Rodríguez, Florentino Fdez-Riverola,
 * Rubén Domínguez Carbajales, Jesús Miguel Herrero Rivas,
 * Eloy Sánchez Hernández, Laura Rivas Moral,
 * Manuel Puga Jiménez de Azcárate, Joaquín Cubiella Fernández,
 * Hugo López-Fernández, Silvia Rodríguez Iglesias, Fernando Campos Tato.
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Polyp} from '../../models/Polyp';
import {Adenoma, PolypType, SSA, TSA} from '../../models/PolypHistology';

@Component({
  selector: '[app-polyp-info]',
  templateUrl: './polyp-info.component.html',
  styleUrls: ['./polyp-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PolypInfoComponent implements OnInit {
  @Input() public polyp: Polyp;
  @Input() public manuallySelected: boolean;

  public type: string;
  public dysplasingGrade: string;

  ngOnInit() {
    switch (this.polyp.histology.polypType) {
      case PolypType.ADENOMA:
        this.type = (<Adenoma>this.polyp.histology).type;
        this.dysplasingGrade = (<Adenoma>this.polyp.histology).dysplasingGrade;
        break;
      case PolypType.SESSILE_SERRATED_ADENOMA:
        this.type = null;
        this.dysplasingGrade = (<SSA>this.polyp.histology).dysplasingGrade;
        break;
      case PolypType.TRADITIONAL_SERRATED_ADENOMA:
        this.type = null;
        this.dysplasingGrade = (<TSA>this.polyp.histology).dysplasingGrade;
        break;
      default:
        this.type = null;
        this.dysplasingGrade = null;
    }
  }

  public hasObservation(): boolean {
    return Boolean(this.polyp.observation) && this.polyp.observation.trim().length > 0;
  }
}
