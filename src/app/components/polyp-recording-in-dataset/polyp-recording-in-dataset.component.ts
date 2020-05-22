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

import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PolypRecording} from '../../models/PolypRecording';
import {PolypRecordingsService} from '../../services/polyprecordings.service';
import {VideoIntervalHighlight} from '../video/VideoIntervalHighlight';
import {areOverlappingIntervals, calculateIntervalSize, Interval, IntervalBoundaries} from '../../models/Interval';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';
import {ExplorationsService} from '../../services/explorations.service';
import {concatMap, map, mergeMap} from 'rxjs/operators';
import {VideoModificationsService} from '../../services/video-modifications.service';
import {PolypDatasetsService} from '../../services/polyp-datasets.service';
import {PolypRecordingBasicData} from '../../models/PolypRecordingBasicData';
import {VideoModification} from '../../models/VideoModification';
import {VideoSnapshot} from '../video/VideoSnapshot';
import {ImagesService} from '../../services/images.service';
import {LocationResult} from '../locate-polyp-in-image-dialog/locate-polyp-in-image-dialog.component';
import {iif} from 'rxjs/internal/observable/iif';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {PolypDataset} from '../../models/PolypDataset';
import {DataUtils} from '../../utils/data.utils';
import {GalleriesService} from '../../services/galleries.service';
import {Gallery} from '../../models/Gallery';
import {of} from 'rxjs/internal/observable/of';
import {Polyp} from '../../models/Polyp';

@Component({
  selector: 'app-polyp-recording-in-dataset',
  templateUrl: './polyp-recording-in-dataset.component.html',
  styleUrls: ['./polyp-recording-in-dataset.component.css']
})
export class PolypRecordingInDatasetComponent implements OnInit {
  private static readonly MODIFICATION_COLOR = 'rgba(241, 213, 117, 1)';
  private static readonly INTERVAL_BOUNDARIES = IntervalBoundaries.BOTH_INCLUDED;

  dataset: PolypDataset;
  datasetId: string;
  polypRecording: PolypRecording;

  highlightZones: VideoIntervalHighlight[] = [];
  videoIsReady = false;

  readonly intervalBoundaries = PolypRecordingInDatasetComponent.INTERVAL_BOUNDARIES;

  private polypRecordings: PolypRecordingBasicData[] = [];
  private completePolypRecordings: Map<number, PolypRecording> = new Map<number, PolypRecording>();
  private currentIndex: number;

  private _snapshot: VideoSnapshot;
  public snapshotDataUrl: string = null;
  public showSnapshotDialog = false;
  private isStoringSnapshot = false;

  @ViewChild('canvas') private canvas: ElementRef<HTMLCanvasElement>;

  constructor(
    private readonly changeDetector: ChangeDetectorRef,
    private readonly notificationService: NotificationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly datasetsService: PolypDatasetsService,
    private readonly explorationsService: ExplorationsService,
    private readonly galleriesService: GalleriesService,
    private readonly imageService: ImagesService,
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

    this.datasetsService.getPolypDataset(this.datasetId)
      .pipe(
        concatMap(
          dataset => iif(() => Boolean(dataset.defaultGallery),
            this.galleriesService.getGallery(dataset.defaultGallery as string)
            .pipe(map(gallery => {
              dataset.defaultGallery = gallery;
              return dataset;
            })),
            of(dataset)
          )
        )
      )
      .subscribe(dataset => this.dataset = dataset);
  }

  get duration(): number {
    return this.calculateIntervalDuration(this.polypRecording);
  }

  get modifications() {
    return this.polypRecording.video.modifications
      .filter(modification => areOverlappingIntervals(modification, this.polypRecording, this.intervalBoundaries));
  }

  get snapshot(): VideoSnapshot {
    return this._snapshot;
  }

  set snapshot(snapshot: VideoSnapshot) {
    if (this._snapshot !== snapshot) {
      if (Boolean(snapshot)) {
        this._snapshot = snapshot;
        const canvas = this.canvas.nativeElement;
        canvas.height = snapshot.height;
        canvas.width = snapshot.width;
        canvas.getContext('2d').drawImage(
          snapshot.video, 0, 0, snapshot.width, snapshot.height
        );
        this.snapshotDataUrl = canvas.toDataURL();

        const video = this.polypRecording.video;
        const snapshotFileName = video.id + '_' + Math.round(video.fps * snapshot.time) + '.png';
      } else {
        this._snapshot = null;
        this.snapshotDataUrl = null;
      }
    }
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

  hasGallery() {
    return Boolean(this.dataset) && Boolean(this.dataset.defaultGallery);
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

  onSnapshot(snapshot: VideoSnapshot): void {
    this.snapshot = snapshot;
    this.showSnapshotDialog = true;
  }

  private changePolypRecording(polypRecording: PolypRecording) {
    this.polypRecording = polypRecording;
    this.highlightZones = this.modifications.map(modification => ({
      interval: modification,
      color: PolypRecordingInDatasetComponent.MODIFICATION_COLOR
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

  onLocatePolypClose(location: LocationResult): void {
    if (location.cancelled) {
      this.snapshot = null;
    } else {
      this.isStoringSnapshot = true;

      if (this.hasGallery()) {
        const gallery = this.dataset.defaultGallery as Gallery;

        this.imageService.uploadImage({
          image: DataUtils.imageUriToFile(this.snapshotDataUrl),
          gallery: gallery.id,
          manuallySelected: true,
          numFrame: Math.round(this.polypRecording.video.fps * this.snapshot.time),
          observation: '',
          polyp: this.polypRecording.polyp.id,
          video: this.polypRecording.video.id
        })
          .pipe(
            mergeMap(image => iif(
              () => Boolean(location.location),
              this.imageService.createLocation(image.id, location.location)
            ))
          )
          .subscribe(() => {
            this.isStoringSnapshot = false;
            this.notificationService.success(
              `Image has been stored in gallery '${gallery.title}'`,
              'Image stored'
            );
          });
      } else {
        this.notificationService.error(
          'Snapshot image could not be stored as the polyp dataset does not have an assigned gallery.',
          'Image storage fail'
        );
      }
    }
  }
}
