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

import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {Polyp} from '../../models/Polyp';
import {ClrDatagridPagination, ClrDatagridStateInterface} from '@clr/angular';
import {Subject} from 'rxjs/internal/Subject';
import {PolypDataset} from '../../models/PolypDataset';
import {ExplorationsService} from '../../services/explorations.service';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {PolypRecordingsService} from '../../services/polyprecordings.service';
import {concatMap, debounceTime, distinctUntilChanged, map, tap} from 'rxjs/operators';
import {PolypDatasetsService} from '../../services/polyp-datasets.service';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';
import {GalleriesService} from '../../services/galleries.service';
import {Gallery} from '../../models/Gallery';
import {Subscription} from 'rxjs/internal/Subscription';
import {iif} from 'rxjs/internal/observable/iif';
import {defer} from 'rxjs/internal/observable/defer';
import {of} from 'rxjs/internal/observable/of';
import {ImagesService} from '../../services/images.service';
import {IntervalBoundaries, isInInterval} from '../../models/Interval';
import {Image} from '../../models/Image';
import {SortDirection} from '../../services/entities/SortDirection';
import {PolypRecordingInDataset} from '../../models/PolypRecordingInDataset';

@Component({
  selector: 'app-polyp-dataset',
  templateUrl: './polyp-dataset.component.html',
  styleUrls: ['./polyp-dataset.component.css']
})
export class PolypDatasetComponent implements OnInit {
  // Data
  id: string;
  polypDataset: PolypDataset;
  polyps: Polyp[] = [];
  polypRecordings: PolypRecordingInDataset[] = [];
  galleries: Gallery[] = [];
  polypRecordingImages = new Map<PolypRecordingInDataset, number>();

  // Polyp Pagination
  private _polypsPagination: ClrDatagridPagination;
  private polypsSubscription: Subscription;
  private polypsLoadedPage = 1;
  private polypsLoadedPageSize = 10;
  polypsPaginationTotalItems = 0;
  polypsPageSize = 10;
  polypsPageChangeEvent = new Subject<string>();
  polypsLoading = false;

  // Polyp Recording Pagination
  private _polypRecordingsPagination: ClrDatagridPagination;
  private polypRecordingsSubscription: Subscription;
  private polypRecordingsLoadedPage = 1;
  private polypRecordingsLoadedPageSize = 10;
  polypRecordingsPaginationTotalItems = 0;
  polypRecordingsPageSize = 10;
  polypRecordingsPageChangeEvent = new Subject<string>();
  polypRecordingsLoading = false;

  private polypRecordingSort: { images: SortDirection } = null;

  get polypRecordingQueryParams(): { imagesSort: SortDirection } {
    if (Boolean(this.polypRecordingSort)) {
      return {
        imagesSort: this.polypRecordingSort.images
      };
    } else {
      return undefined;
    }
  }

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private readonly explorationsService: ExplorationsService,
    private readonly galleriesService: GalleriesService,
    private readonly imagesService: ImagesService,
    private readonly notificationService: NotificationService,
    private readonly polypDatasetsService: PolypDatasetsService,
    private readonly polypRecordingsService: PolypRecordingsService
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');

    this.polypDatasetsService.getPolypDataset(this.id)
      .pipe(
        concatMap(polypDataset => iif(() => Boolean(polypDataset.defaultGallery),
          defer(() => this.galleriesService.getGallery(polypDataset.defaultGallery as string)
            .pipe(
              tap(gallery => polypDataset.defaultGallery = gallery),
              map(() => polypDataset)
            )
          ),
          of(polypDataset)
        ))
      )
      .subscribe(polypDataset => this.polypDataset = polypDataset);
    this.galleriesService.listGalleries()
      .subscribe(galleries => this.galleries = galleries);
  }

  @ViewChild('polypsPagination') set polypsPagination(polypsPagination: ClrDatagridPagination) {
    if (this._polypsPagination !== polypsPagination) {
      if (Boolean(this.polypsSubscription)) {
        this.polypsSubscription.unsubscribe();
        this.polypsSubscription = null;
      }

      this._polypsPagination = polypsPagination;

      if (Boolean(this._polypsPagination)) {
        this.polypsSubscription = this.polypsPageChangeEvent.pipe(
          debounceTime(500),
          distinctUntilChanged()
        ).subscribe(page => {
          if (this.isValidPolypsPage(page)) {
            this.polypsPagination.page.current = Number(page);
          } else {
            this.notificationService.error('Invalid page entered.', 'Invalid page.');
          }
        });

        this.polypsPagination.page.current = this.polypsLoadedPage;
        this.polypsPagination.page.size = this.polypsLoadedPageSize;
        this.changeDetectorRef.detectChanges();
        this.getPagePolyps(this.polyps.length === 0);
      }
    }
  }

  get polypsPagination(): ClrDatagridPagination {
    return this._polypsPagination;
  }

  hasPolypsPagination(): boolean {
    return this._polypsPagination !== undefined;
  }

  countPolyps(): number {
    return this.polypDataset.polyps.length;
  }

  @ViewChild('polypRecordingsPagination') set polypRecordingsPagination(polypRecordingsPagination: ClrDatagridPagination) {
    if (this._polypRecordingsPagination !== polypRecordingsPagination) {
      if (Boolean(this.polypRecordingsSubscription)) {
        this.polypRecordingsSubscription.unsubscribe();
        this.polypRecordingsSubscription = null;
      }

      this._polypRecordingsPagination = polypRecordingsPagination;

      if (Boolean(this._polypRecordingsPagination)) {
        this.polypRecordingsSubscription = this.polypRecordingsPageChangeEvent.pipe(
          debounceTime(500),
          distinctUntilChanged()
        ).subscribe(page => {
          if (this.isValidPolypRecordingsPage(page)) {
            this.polypRecordingsPagination.page.current = Number(page);
          } else {
            this.notificationService.error('Invalid page entered.', 'Invalid page.');
          }
        });

        this.polypRecordingsPagination.page.current = this.polypRecordingsLoadedPage;
        this.polypRecordingsPagination.page.size = this.polypRecordingsLoadedPageSize;
        this.changeDetectorRef.detectChanges();
        this.getPagePolypRecordings(this.polypRecordings.length === 0);
      }
    }
  }

  get polypRecordingsPagination(): ClrDatagridPagination {
    return this._polypRecordingsPagination;
  }

  hasPolypRecordingsPagination(): boolean {
    return Boolean(this._polypRecordingsPagination);
  }

  private isValidPolypsPage(page: string): boolean {
    if (!this.hasPolypsPagination()) {
      return false;
    }

    const pageNumber = Number(page);

    return !isNaN(pageNumber) && pageNumber > 0
      && pageNumber <= Math.ceil(this.polypsPaginationTotalItems / this.polypsPageSize);
  }

  get currentPolypsPage(): number {
    return this.hasPolypsPagination() ? this.polypsPagination.page.current : 0;
  }

  set currentPolypsPage(page: number) {
    if (typeof page === 'number' && this.hasPolypsPagination()) {
      this.polypsPagination.page.current = page;
    }
  }

  refreshPolypsPage(state: ClrDatagridStateInterface) {
    if (state.page !== undefined && this.hasPolypsPagination()) {
      this.polypsPagination.page.current = (state.page.from / state.page.size) + 1;
      this.getPagePolyps();
    }
  }

  private getPagePolyps(force: boolean = false) {
    if (force || this.currentPolypsPage !== this.polypsLoadedPageSize || this.polypsPageSize !== this.polypsLoadedPageSize) {
      this.polypsLoading = true;
      this.changeDetectorRef.detectChanges();
      this.polypDatasetsService.getPolyps(this.id, this.currentPolypsPage, this.polypsPageSize)
        .pipe(
          concatMap(polypPage => iif(() => polypPage.polyps.length > 0,
            defer(() => forkJoin(
              this.explorationsService.addExplorationsToPolyps(polypPage.polyps),
              this.polypRecordingsService.addRecordingsToPolyps(polypPage.polyps)
            ).pipe(
              map(() => polypPage)
            )),
            of(polypPage)
          ))
        )
        .subscribe(polypsPage => {
          this.polyps = polypsPage.polyps;
          this.polypsLoadedPage = this.currentPolypsPage;
          this.polypsLoadedPageSize = this.polypsPageSize;
          this.polypsPaginationTotalItems = polypsPage.totalItems;
          this.polypsLoading = false;
        });
    }
  }

  get currentPolypRecordingsPage(): number {
    return this.hasPolypRecordingsPagination() ? this.polypRecordingsPagination.page.current : 0;
  }

  set currentPolypRecordingsPage(page: number) {
    if (typeof page === 'number' && this.hasPolypRecordingsPagination()) {
      this.polypRecordingsPagination.page.current = page;
    }
  }

  countPolypRecordingImages(polypRecording: PolypRecordingInDataset): number {
    return this.polypRecordingImages.has(polypRecording) ? this.polypRecordingImages.get(polypRecording) : 0;
  }

  refreshPolypRecordingsPage(state: ClrDatagridStateInterface) {
    let force = false;
    if (Boolean(state.sort) && state.sort.by === 'images') {
      const newDirection = state.sort.reverse ? SortDirection.DESCENDING : SortDirection.ASCENDING;
      if (this.polypRecordingSort === null || this.polypRecordingSort.images !== newDirection) {
        force = true;
        this.polypRecordingSort = {
          images: newDirection
        };
      }
    }

    if (state.page !== undefined && this.hasPolypRecordingsPagination()) {
      this.polypRecordingsPagination.page.current = (state.page.from / state.page.size) + 1;
      this.getPagePolypRecordings(force);
    }
  }

  private isValidPolypRecordingsPage(page: string): boolean {
    if (!this.hasPolypRecordingsPagination()) {
      return false;
    }

    const pageNumber = Number(page);

    return !isNaN(pageNumber) && pageNumber > 0
      && pageNumber <= Math.ceil(this.polypRecordingsPaginationTotalItems / this.polypsPageSize);
  }

  private getPagePolypRecordings(force: boolean = false) {
    if (force
      || this.currentPolypRecordingsPage !== this.polypRecordingsLoadedPage
      || this.polypRecordingsPageSize !== this.polypRecordingsLoadedPageSize
    ) {
      this.polypRecordingsLoading = true;
      this.changeDetectorRef.detectChanges();

      const isImageInRecording = (image: Image, polypRecording: PolypRecordingInDataset) => {
        const time = image.numFrame / polypRecording.video.fps;

        return isInInterval(time, polypRecording, IntervalBoundaries.BOTH_INCLUDED, true);
      };

      this.polypDatasetsService.listPolypRecordings(
        this.id, this.currentPolypRecordingsPage, this.polypRecordingsPageSize, this.polypRecordingSort
      )
        .pipe(
          concatMap(page => iif(() => page.polypRecordings.some(polypRecording => typeof polypRecording.polyp.exploration === 'string'),
            defer(() => forkJoin(
                page.polypRecordings.map(polypRecording => polypRecording.polyp.exploration)
                  .filter(exploration => typeof exploration === 'string')
                  .filter((v, i, a) => a.indexOf(v) === i) // Removes duplicates
                  .map(explorationId => this.explorationsService.getExploration((explorationId as string)))
              ).pipe(
                tap(explorations => page.polypRecordings.forEach(polypRecording => {
                  const currentExploration = polypRecording.polyp.exploration;

                  if (typeof currentExploration === 'string') {
                    polypRecording.polyp.exploration = explorations.find(exploration => exploration.id === currentExploration);
                  }
                })),
                map(() => page)
              )
            ),
            of(page)
          )),
          concatMap(page => iif(() => page.polypRecordings.length > 0 && Boolean(this.polypDataset.defaultGallery),
            defer(() => forkJoin(
                page.polypRecordings.map(
                  polypRecording => this.imagesService.listImagesByPolypAndGallery(
                    polypRecording.polyp, this.polypDataset.defaultGallery as Gallery
                  )
                )
              ).pipe(
                tap(images => images.forEach((polypImages, index) => {
                  const count = polypImages.filter(image => isImageInRecording(image, page.polypRecordings[index])).length;
                  this.polypRecordingImages.set(page.polypRecordings[index], count);
                })),
                map(() => page)
              )
            ),
            of(page)
          ))
        )
        .subscribe(polypRecordingsPage => {
          this.polypRecordings = polypRecordingsPage.polypRecordings;
          this.polypRecordingsLoadedPage = this.currentPolypRecordingsPage;
          this.polypRecordingsLoadedPageSize = this.polypRecordingsPageSize;
          this.polypRecordingsPaginationTotalItems = polypRecordingsPage.totalItems;
          this.polypRecordingsLoading = false;
        });
    }
  }
}
