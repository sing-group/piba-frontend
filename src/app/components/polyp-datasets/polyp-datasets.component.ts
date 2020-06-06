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
import {ClrDatagridPagination, ClrDatagridStateInterface} from '@clr/angular';
import {Subject} from 'rxjs/internal/Subject';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {concatMap, debounceTime, distinctUntilChanged, map, tap} from 'rxjs/operators';
import {PolypDataset} from '../../models/PolypDataset';
import {PolypDatasetsService} from '../../services/polyp-datasets.service';
import {iif} from 'rxjs/internal/observable/iif';
import {defer} from 'rxjs/internal/observable/defer';
import {GalleriesService} from '../../services/galleries.service';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';
import {of} from 'rxjs/internal/observable/of';

@Component({
  selector: 'app-polyp-datasets',
  templateUrl: './polyp-datasets.component.html',
  styleUrls: ['./polyp-datasets.component.css']
})
export class PolypDatasetsComponent implements OnInit {
  // Data
  polypDatasets: PolypDataset[] = [];

  // Status
  loading = false;

  // Pagination
  @ViewChild(ClrDatagridPagination)
  pagination: ClrDatagridPagination;
  paginationTotalItems = 0;
  pageSize = 15;
  pageChangeEvent = new Subject<string>();

  // Polyp dataset management
  showCreatePolypDataset = false;
  showDeleteConfirmation = false;

  datasetToDelete: PolypDataset;
  datasetToEdit: PolypDataset;

  constructor(
    private readonly notificationService: NotificationService,
    private readonly galleriesService: GalleriesService,
    private readonly polypDatasetsService: PolypDatasetsService
  ) { }

  ngOnInit() {
    this.pageChangeEvent.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(page => {
      if (this.isValidPage(page)) {
        this.pagination.page.current = Number(page);
      } else {
        this.notificationService.error('Invalid page entered.', 'Invalid page.');
      }
    });

    this.pagination.page.current = 1;
    this.getPagePolypDatasets();
  }

  private isValidPage(page: string): boolean {
    const pageNumber = Number(page);

    return !isNaN(pageNumber) && pageNumber > 0
      && pageNumber <= Math.ceil(this.paginationTotalItems / this.pageSize);
  }

  get currentPage(): number {
    return this.pagination.page.current;
  }

  set currentPage(page: number) {
    if (typeof page === 'number') {
      this.pagination.page.current = page;
    }
  }

  refreshPage(state: ClrDatagridStateInterface) {
    if (state.page !== undefined) {
      this.pagination.page.current = (state.page.from / state.page.size) + 1;
      this.getPagePolypDatasets();
    }
  }

  private getPagePolypDatasets() {
    this.loading = true;
    this.polypDatasetsService.getPolypDatasets(this.currentPage, this.pageSize)
      .pipe(
        concatMap(datasets => iif(() => datasets.polypDatasets.length > 0,
          defer(() => forkJoin(datasets.polypDatasets
            .filter(dataset => Boolean(dataset.defaultGallery))
            .map(dataset => dataset.defaultGallery as string)
            .filter((v, i, a) => a.indexOf(v) === i) // Removes duplicates
            .map(galleryId => this.galleriesService.getGallery(galleryId))
          ).pipe(
            tap(galleries => datasets.polypDatasets
              .forEach(dataset => dataset.defaultGallery = galleries.find(gallery => gallery.id === dataset.defaultGallery))
            ),
            map(() => datasets)
          )),
          of(datasets)
        ))
      )
      .subscribe(polypsPage => {
        this.polypDatasets = polypsPage.polypDatasets;
        this.paginationTotalItems = polypsPage.totalItems;
        this.loading = false;
      });
  }

  onAskForDeletionConfirmation(dataset: PolypDataset) {
    this.datasetToDelete = dataset;
    this.showDeleteConfirmation = true;
  }

  onShowCreationDialog() {
    this.showCreatePolypDataset = true;
  }

  onCreatePolypDataset(dataset: PolypDataset) {
    if (Boolean(dataset)) {
      this.loading = true;

      if (Boolean(dataset.id)) {
        this.polypDatasetsService.editPolypDataset(dataset)
          .subscribe(() => {
            this.getPagePolypDatasets();
            this.notificationService.success(
              `Polyp dataset '${dataset.title}' has been modified.`,
              'Polyp dataset modified'
            );
          });
      } else {
        this.polypDatasetsService.createPolypDataset(dataset)
          .subscribe(() => {
            this.getPagePolypDatasets();
            this.notificationService.success(
              `Polyp dataset '${dataset.title}' has been created.`,
              'Polyp dataset created'
            );
          });
      }
    }

    this.showCreatePolypDataset = false;
    this.datasetToEdit = null;
  }

  onShowEditionDialog(dataset: PolypDataset) {
    this.datasetToEdit = dataset;
    this.showCreatePolypDataset = true;
  }

  onDeletionConfirmation() {
    this.showDeleteConfirmation = false;
    this.polypDatasetsService.deletePolypDataset(this.datasetToDelete.id)
      .subscribe(() => {
        this.getPagePolypDatasets();
        this.notificationService.success(
          `Polyp dataset '${this.datasetToDelete.title}' has been deleted.`,
          'Polyp dataset deleted'
        );
      });
  }

  onDeletionCancel() {
    this.showDeleteConfirmation = false;
  }
}
