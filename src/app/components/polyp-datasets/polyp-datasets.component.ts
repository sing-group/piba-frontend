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
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {PolypDataset} from '../../models/PolypDataset';
import {PolypDatasetsService} from '../../services/polyp-datasets.service';

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

  constructor(
    private readonly notificationService: NotificationService,
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
      .subscribe(polypsPage => {
        this.polypDatasets = polypsPage.polypDatasets;
        this.paginationTotalItems = polypsPage.totalItems;
        this.loading = false;
      });
  }

  remove(dataset: PolypDataset) {

  }

  edit(dataset: PolypDataset) {

  }
}
