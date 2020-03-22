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
import {ExplorationsService} from '../../services/explorations.service';
import {Exploration} from '../../models/Exploration';
import {PatientsService} from '../../services/patients.service';
import {IdSpacesService} from '../../services/idspaces.service';
import {IdSpace} from '../../models/IdSpace';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {ActivatedRoute} from '@angular/router';
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';

@Component({
  selector: 'app-explorations',
  templateUrl: './explorations.component.html',
  styleUrls: ['./explorations.component.css']
})

export class ExplorationsComponent implements OnInit {

  explorations: Exploration[] = [];
  pageChangeEvent = new Subject<string>();

  editingExploration = false;
  creatingExploration = false;
  deletingExploration = false;
  paginatePatientExplorations = false;
  loading = false;
  date: string;
  location: string;
  title: string;
  newExploration: Exploration;
  exploration: Exploration = new Exploration();
  paginationTotalItems = 0;
  pageSize = 15;

  patientId: string;
  patientError: string;

  idSpaces: IdSpace[];
  idSpace: IdSpace = new IdSpace();

  idSpaceToFind: IdSpace = new IdSpace();
  patientToFind = '';

  @ViewChild(ClrDatagridPagination)
  pagination: ClrDatagridPagination;

  constructor(private explorationsService: ExplorationsService, private patientsService: PatientsService,
              private idSpacesService: IdSpacesService, private notificationService: NotificationService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    // to wait when the user types the page to go
    this.pageChangeEvent.pipe(
      debounceTime(500),
      distinctUntilChanged()).subscribe(page => {
      if (this.isValidPage(page)) {
        this.pagination.page.current = Number(page);
      } else {
        this.notificationService.error('Invalid page entered.', 'Invalid page.');
      }
    });

    this.idSpacesService.getIdSpaces().subscribe(idSpaces => this.idSpaces = idSpaces);

    const patient = this.route.snapshot.paramMap.get('id');
    const publicPatient = this.route.snapshot.paramMap.get('patientId');
    if (patient !== null) {
      this.patientsService.getPatient(patient).subscribe(patientFound => {
        this.patientToFind = publicPatient;
        this.idSpaceToFind = this.idSpaces.find(idspace => idspace.id === patientFound.idSpace.id);
        this.searchPatient();
      });
    } else {
      this.pagination.page.current = 1;
      this.getPageExplorations();
    }
  }

  private isValidPage(page: string): boolean {
    const pageNumber = Number(page);

    return !isNaN(pageNumber) && pageNumber > 0
      && pageNumber <= Math.ceil(this.paginationTotalItems / this.pageSize);
  }

  edit(id: string) {
    this.exploration = new Exploration();
    Object.assign(this.exploration, this.explorations.find((exploration) => exploration.id === id));
    this.date = new Date(this.exploration.explorationDate).toLocaleDateString();
    this.location = this.exploration.location;
    this.title = this.exploration.title;
    this.editingExploration = true;
    this.creatingExploration = false;
  }

  save() {
    if (!this.editingExploration) {
      this.patientsService.getPatientID(this.patientId, this.idSpace.id).subscribe(patient => {
          this.newExploration = {
            id: null,
            title: this.title,
            explorationDate: new Date(this.date),
            location: this.location,
            videos: [],
            polyps: [],
            numVideos: 0,
            numPolyps: 0,
            patient: patient,
            confirmed: false
          };
          this.explorationsService.createExploration(this.newExploration)
            .subscribe(newExploration => {
              this.explorations = this.explorations.concat(newExploration);
              this.patientError = null;
              this.notificationService.success('Exploration registered successfully.', 'Exploration registered.');
              this.getPageExplorations();
              this.cancel();
            });
        }, error => {
          this.patientError = error;
        }
      );
    } else {
      this.exploration.title = this.title;
      this.exploration.location = this.location;
      this.exploration.explorationDate = new Date(this.date);
      this.explorationsService.editExploration(this.exploration).subscribe(updatedExploration => {
        Object.assign(this.explorations.find((exploration) => exploration.id === this.exploration.id), updatedExploration);
        this.notificationService.success('Exploration edited successfully.', 'Exploration edited.');
        this.getPageExplorations();
        this.cancel();
      });
    }
  }

  get currentPage(): number {
    return this.pagination.page.current;
  }

  set currentPage(page: number) {
    if (typeof page === 'number') {
      this.pagination.page.current = page;
    }
  }

  getPageExplorations() {
    this.loading = true;
    if (this.paginatePatientExplorations) {
      this.getPageExplorationsByPatient();
    } else {
      this.getPageTotalExplorations();
    }
  }

  // Return the explorations of the current page
  getPageTotalExplorations() {
    this.explorationsService.getTotalExplorations(this.currentPage, this.pageSize).subscribe(explorationPage => {
      this.paginationTotalItems = explorationPage.totalItems;
      this.explorations = explorationPage.explorations;
      this.loading = false;
    });
  }

  // Return the explorations of a patient's current page
  getPageExplorationsByPatient() {
    this.explorationsService.getExplorationsBy(this.patientToFind, this.idSpaceToFind, this.currentPage, this.pageSize)
      .subscribe(explorationPage => {
        this.paginationTotalItems = explorationPage.totalItems;
        this.explorations = explorationPage.explorations;
        this.loading = false;
      });
  }


  // It is executed when the page is changed in the view
  refreshPage(state: ClrDatagridStateInterface) {
    if (state.page !== undefined) {
      this.pagination.page.current = (state.page.from / state.page.size) + 1;
      this.getPageExplorations();
    }
  }

  public cancel() {
    this.date = null;
    this.location = null;
    this.title = null;
    this.creatingExploration = false;
    this.editingExploration = false;
    this.deletingExploration = false;
    this.patientId = null;
    this.idSpace = null;
    this.patientError = null;
  }

  delete(id: string) {
    this.explorationsService.delete(id).subscribe(() => {
        const index = this.explorations.indexOf(
          this.explorations.find((exploration) => exploration.id === id
          )
        );
        this.explorations.splice(index, 1);
        this.notificationService.success('Exploration removed successfully.', 'Exploration removed.');
        this.getPageExplorations();
        this.cancel();
      }
    );
  }

  remove(id: string) {
    this.deletingExploration = true;
    this.exploration = this.explorations.find((exploration) => exploration.id === id);
  }

  public isPatientIdCorrect(): Boolean {
    return this.editingExploration || (this.patientId !== null && this.patientId !== undefined && this.patientId !== '');
  }

  public isIdSpaceCorrect(): Boolean {
    return this.editingExploration || (this.idSpace !== null && this.idSpace !== undefined && this.idSpace.id !== undefined);
  }

  searchPatient() {
    if (this.idSpaceToFind.id !== undefined && this.patientToFind === '') {
      this.notificationService.error('Selected an patient', 'Not possible to do the search');
      return;
    }
    if (this.idSpaceToFind.id === undefined && this.patientToFind !== '') {
      this.notificationService.error('Selected an ID Space', 'Not possible to do the search');
      return;
    }
    if (this.idSpaceToFind.id === undefined && this.patientToFind === '') {
      return;
    }
    this.goToFirstPage();
    this.paginatePatientExplorations = true;
    this.getPageExplorations();
  }

  clear() {
    this.patientToFind = '';
    this.idSpace = new IdSpace();
    this.idSpaceToFind = new IdSpace();
    this.paginatePatientExplorations = false;
    this.goToFirstPage();
    this.getPageExplorations();
  }

  goToFirstPage() {
    if (<HTMLInputElement>document.getElementById('page-to-go') !== null) {
      (<HTMLInputElement>document.getElementById('page-to-go')).value = '1';
    }
    this.pagination.page.current = 1;
  }
}

