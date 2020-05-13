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

import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PolypRecording} from '../../models/PolypRecording';
import {PolypRecordingsService} from '../../services/polyprecordings.service';
import {VideoSnapshot} from '../video/VideoSnapshot';

@Component({
  selector: 'app-polyp-recording-in-gallery',
  templateUrl: './polyp-recording-in-gallery.component.html',
  styleUrls: ['./polyp-recording-in-gallery.component.css']
})
export class PolypRecordingInGalleryComponent implements OnInit {
  polypRecording: PolypRecording;
  datasetId: string;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly polypRecordingsService: PolypRecordingsService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.datasetId = this.route.snapshot.paramMap.get('datasetId');

    this.polypRecordingsService.getPolypRecording(id)
      .subscribe(polypRecording => this.polypRecording = polypRecording);
  }

  onCurrentTimeUpdate(currentTime: number): void {

  }

  onSnapshot(snapshot: VideoSnapshot): void {

  }
}
