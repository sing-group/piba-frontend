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

import {Component, OnInit, ViewChild} from '@angular/core';
import {Polyp} from '../../models/Polyp';
import {ClrDatagridPagination, ClrDatagridStateInterface} from '@clr/angular';
import {Subject} from 'rxjs/internal/Subject';
import {PolypDataset} from '../../models/PolypDataset';
import {ExplorationsService} from '../../services/explorations.service';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {PolypRecordingsService} from '../../services/polyprecordings.service';
import {concatMap, debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import {PolypDatasetsService} from '../../services/polyp-datasets.service';
import {ActivatedRoute} from '@angular/router';
import {PolypRecording} from '../../models/PolypRecording';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';

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
  polypRecordings: PolypRecording[] = [];

  // Polyp Pagination
  private _polypsPagination: ClrDatagridPagination;
  polypsPaginationTotalItems = 0;
  polypsPageSize = 10;
  polypsPageChangeEvent = new Subject<string>();
  polypsLoading = false;

  // Polyp Recording Pagination
  private _polypRecordingsPagination: ClrDatagridPagination;
  polypRecordingsPaginationTotalItems = 0;
  polypRecordingsPageSize = 10;
  polypRecordingsPageChangeEvent = new Subject<string>();
  polypRecordingsLoading = false;

  constructor(
    private readonly explorationsService: ExplorationsService,
    private readonly notificationService: NotificationService,
    private readonly polypDatasetsService: PolypDatasetsService,
    private readonly polypRecordingsService: PolypRecordingsService,
    private readonly route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');

    this.polypDatasetsService.getPolypDataset(this.id)
      .subscribe(polypDataset => this.polypDataset = polypDataset);
  }

  @ViewChild(ClrDatagridPagination) set polypsPagination(polypsPagination: ClrDatagridPagination) {
    if (this._polypsPagination !== polypsPagination) {
      this._polypsPagination = polypsPagination;

      this.polypsPageChangeEvent.pipe(
        debounceTime(500),
        distinctUntilChanged()
      ).subscribe(page => {
        if (this.isValidPolypsPage(page)) {
          this.polypsPagination.page.current = Number(page);
        } else {
          this.notificationService.error('Invalid page entered.', 'Invalid page.');
        }
      });

      this.polypsPagination.page.current = 1;
      this.getPagePolyps();
    }
  }

  get polypsPagination(): ClrDatagridPagination {
    return this._polypsPagination;
  }

  hasPolypsPagination(): boolean {
    return this._polypsPagination !== undefined;
  }

  @ViewChild(ClrDatagridPagination) set polypRecordingsPagination(polypRecordingsPagination: ClrDatagridPagination) {
    if (this._polypRecordingsPagination !== polypRecordingsPagination) {
      this._polypRecordingsPagination = polypRecordingsPagination;

      this.polypRecordingsPageChangeEvent.pipe(
        debounceTime(500),
        distinctUntilChanged()
      ).subscribe(page => {
        if (this.isValidPolypRecordingsPage(page)) {
          this.polypRecordingsPagination.page.current = Number(page);
        } else {
          this.notificationService.error('Invalid page entered.', 'Invalid page.');
        }
      });

      this.polypRecordingsPagination.page.current = 1;
      this.getPagePolypRecordings();
    }
  }

  get polypRecordingsPagination(): ClrDatagridPagination {
    return this._polypRecordingsPagination;
  }

  hasPolypRecordingsPagination(): boolean {
    return this._polypRecordingsPagination !== undefined;
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

  private getPagePolyps() {
    this.polypsLoading = true;
    this.polypDatasetsService.getPolyps(this.id, this.currentPolypsPage, this.polypsPageSize)
      .pipe(
        concatMap(polypPage => this.explorationsService.addExplorationsToPolyps(polypPage.polyps)
          .pipe(
            map(polyps => {
              polypPage.polyps = polyps;
              return polypPage;
            })
          )
        ),
        concatMap(polypPage => this.polypRecordingsService.addRecordingsToPolyps(polypPage.polyps)
          .pipe(
            map(polyps => {
              polypPage.polyps = polyps;
              return polypPage;
            })
          )
        )
      )
      .subscribe(polypsPage => {
        this.polyps = polypsPage.polyps;
        this.polypsPaginationTotalItems = polypsPage.totalItems;
        this.polypsLoading = false;
      });
  }

  get currentPolypRecordingsPage(): number {
    return this.hasPolypRecordingsPagination() ? this.polypRecordingsPagination.page.current : 0;
  }

  set currentPolypRecordingsPage(page: number) {
    if (typeof page === 'number' && this.hasPolypRecordingsPagination()) {
      this.polypRecordingsPagination.page.current = page;
    }
  }

  refreshPolypRecordingsPage(state: ClrDatagridStateInterface) {
    if (state.page !== undefined && this.hasPolypRecordingsPagination()) {
      this.polypRecordingsPagination.page.current = (state.page.from / state.page.size) + 1;
      this.getPagePolypRecordings();
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

  private getPagePolypRecordings() {
    this.polypRecordingsLoading = true;
    this.polypDatasetsService.listPolypRecordings(this.id, this.currentPolypRecordingsPage, this.polypRecordingsPageSize)
      .subscribe(polypRecordingsPage => {
        this.polypRecordings = polypRecordingsPage.polypRecordings;
        this.polypRecordingsPaginationTotalItems = polypRecordingsPage.totalItems;
        this.polypRecordingsLoading = false;
      });
    this.polypDatasetsService.listPolypRecordings(this.id, this.currentPolypRecordingsPage, this.polypRecordingsPageSize)
      .pipe(
        concatMap(page =>
          forkJoin(
            page.polypRecordings.map(polypRecording => polypRecording.polyp.exploration)
              .filter(exploration => typeof exploration === 'string')
              .filter((v, i, a) => a.indexOf(v) === i) // Removes duplicates
              .map(explorationId => this.explorationsService.getExploration((explorationId as string)))
          ).pipe(
            map(explorations => {
              page.polypRecordings.forEach(polypRecording => {
                const currentExploration = polypRecording.polyp.exploration;

                if (typeof currentExploration === 'string') {
                  polypRecording.polyp.exploration = explorations.find(exploration => exploration.id === currentExploration);
                }
              });

              return page;
            })
          )
        )
      )
      .subscribe(polypRecordingsPage => {
        this.polypRecordings = polypRecordingsPage.polypRecordings;
        this.polypRecordingsPaginationTotalItems = polypRecordingsPage.totalItems;
        this.polypRecordingsLoading = false;
      });
  }

  countPolyps(): number {
    return this.polypDataset.polyps.length;
  }
}
