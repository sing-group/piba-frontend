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

import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PolypRecording} from '../../models/PolypRecording';
import {PolypRecordingsService} from '../../services/polyprecordings.service';
import {VideoSnapshot} from '../video/VideoSnapshot';
import {VideoIntervalHighlight} from '../video/VideoIntervalHighlight';
import {areOverlappingIntervals} from '../../models/Interval';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';
import {ExplorationsService} from '../../services/explorations.service';
import {concatMap, map} from 'rxjs/operators';
import {VideoModificationsService} from '../../services/video-modifications.service';

@Component({
  selector: 'app-polyp-recording-in-gallery',
  templateUrl: './polyp-recording-in-gallery.component.html',
  styleUrls: ['./polyp-recording-in-gallery.component.css']
})
export class PolypRecordingInGalleryComponent implements OnInit {
  private static readonly MODIFICATION_COLOR = 'rgba(241, 213, 117, 1)';

  polypRecording: PolypRecording;
  datasetId: string;

  highlightZones: VideoIntervalHighlight[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly explorationsService: ExplorationsService,
    private readonly modificationsService: VideoModificationsService,
    private readonly polypRecordingsService: PolypRecordingsService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.datasetId = this.route.snapshot.paramMap.get('datasetId');

    this.polypRecordingsService.getPolypRecording(id)
      .pipe(
        concatMap(polypRecording =>
          forkJoin(
            this.explorationsService.getExploration((polypRecording.video.exploration as string)),
            this.modificationsService.getVideoModifications(polypRecording.video.id)
          )
          .pipe(
            map(explorationAndModifications => {
              polypRecording.polyp.exploration = explorationAndModifications[0];
              polypRecording.video.exploration = explorationAndModifications[0];
              polypRecording.video.modifications = explorationAndModifications[1];

              return polypRecording;
            })
          )
        )
      )
      .subscribe(polypRecording => {
        this.polypRecording = polypRecording;
        this.highlightZones = this.modifications.map(modification => ({
          interval: modification,
          color: PolypRecordingInGalleryComponent.MODIFICATION_COLOR
        }));
      });
  }

  onCurrentTimeUpdate(currentTime: number): void {

  }

  onSnapshot(snapshot: VideoSnapshot): void {

  }

  get modifications() {
    return this.polypRecording.video.modifications
      .filter(modification => areOverlappingIntervals(modification, this.polypRecording));
  }
}
