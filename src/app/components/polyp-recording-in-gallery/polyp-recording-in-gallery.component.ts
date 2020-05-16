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

import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PolypRecording} from '../../models/PolypRecording';
import {PolypRecordingsService} from '../../services/polyprecordings.service';
import {VideoIntervalHighlight} from '../video/VideoIntervalHighlight';
import {areOverlappingIntervals, calculateIntervalSize, Interval, IntervalBoundaries} from '../../models/Interval';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';
import {ExplorationsService} from '../../services/explorations.service';
import {concatMap, map} from 'rxjs/operators';
import {VideoModificationsService} from '../../services/video-modifications.service';
import {PolypDatasetsService} from '../../services/polyp-datasets.service';
import {PolypRecordingBasicData} from '../../models/PolypRecordingBasicData';
import {VideoModification} from '../../models/VideoModification';

@Component({
  selector: 'app-polyp-recording-in-gallery',
  templateUrl: './polyp-recording-in-gallery.component.html',
  styleUrls: ['./polyp-recording-in-gallery.component.css']
})
export class PolypRecordingInGalleryComponent implements OnInit {
  private static readonly MODIFICATION_COLOR = 'rgba(241, 213, 117, 1)';
  private static readonly INTERVAL_BOUNDARIES = IntervalBoundaries.BOTH_INCLUDED;

  datasetId: string;
  polypRecording: PolypRecording;

  highlightZones: VideoIntervalHighlight[] = [];
  videoIsReady = false;

  readonly intervalBoundaries = PolypRecordingInGalleryComponent.INTERVAL_BOUNDARIES;

  private polypRecordings: PolypRecordingBasicData[] = [];
  private completePolypRecordings: Map<number, PolypRecording> = new Map<number, PolypRecording>();
  private currentIndex: number;

  constructor(
    private readonly changeDetector: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly datasetsService: PolypDatasetsService,
    private readonly explorationsService: ExplorationsService,
    private readonly modificationsService: VideoModificationsService,
    private readonly polypRecordingsService: PolypRecordingsService
  ) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.datasetId = this.route.snapshot.paramMap.get('datasetId');

    this.datasetsService.listAllPolypRecordingBasicData(this.datasetId)
      .subscribe(polypRecordings => {
        this.polypRecordings = polypRecordings;
        this.fillAndChangePolypRecording(id);
      });
  }

  private changePolypRecording(polypRecording: PolypRecording) {
    this.polypRecording = polypRecording;
    this.highlightZones = this.modifications.map(modification => ({
      interval: modification,
      color: PolypRecordingInGalleryComponent.MODIFICATION_COLOR
    }));
    this.currentIndex = this.polypRecordings.findIndex(value => value.id === polypRecording.id);
  }

  private fillAndChangePolypRecording(id: number) {
    this.polypRecording = null;
    this.videoIsReady = false;
    this.changeDetector.detectChanges();

    if (this.completePolypRecordings.has(id)) {
      this.changePolypRecording(this.completePolypRecordings.get(id));
    } else {
      this.polypRecordingsService.getPolypRecording(id)
        .pipe(
          concatMap(polypRecording =>
            forkJoin(
              this.explorationsService.getExploration((polypRecording.video.exploration as string)),
              this.modificationsService.listVideoModifications(polypRecording.video.id)
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
          this.completePolypRecordings.set(polypRecording.id, polypRecording);
          this.changePolypRecording(polypRecording);
        });
    }
  }

  get duration(): number {
    return this.calculateIntervalDuration(this.polypRecording);
  }


  get modifications() {
    return this.polypRecording.video.modifications
      .filter(modification => areOverlappingIntervals(modification, this.polypRecording, this.intervalBoundaries));
  }

  isLoading(): boolean {
    return this.polypRecording === null;
  }

  isVideoReady(): boolean {
    return this.videoIsReady;
  }

  hasModifications(): boolean {
    return this.modifications.length > 0;
  }

  hasPrevious(): boolean {
    return this.currentIndex > 0;
  }

  hasNext(): boolean {
    return this.currentIndex < this.polypRecordings.length - 1;
  }

  calculateModificationDuration(modification: VideoModification): number {
    return this.calculateIntervalDuration({
      start: Math.max(this.polypRecording.start, modification.start),
      end: Math.min(this.polypRecording.end, modification.end)
    });
  }

  private calculateIntervalDuration(interval: Interval): number {
    return calculateIntervalSize(interval, this.intervalBoundaries);
  }

  onReady() {
    this.videoIsReady = true;
  }

  onGoToPrevious(): void {
    if (!this.hasPrevious()) {
      throw new Error('No previous polyp recording');
    }

    const previous = this.polypRecordings[this.currentIndex - 1];
    this.router.navigateByUrl(`/polypdatasets/${this.datasetId}/polyprecording/${previous.id}`)
      .then(() => this.fillAndChangePolypRecording(previous.id));
  }

  onGoToNext(): void {
    if (!this.hasNext()) {
      throw new Error('No next polyp recording');
    }

    const next = this.polypRecordings[this.currentIndex + 1];
    this.router.navigateByUrl(`/polypdatasets/${this.datasetId}/polyprecording/${next.id}`)
      .then(() => this.fillAndChangePolypRecording(next.id));
  }
}
