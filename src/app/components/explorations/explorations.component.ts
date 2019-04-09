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
  pageLength = 0;

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
      if (Number(page) > 0 && Number(page) <= Math.ceil(this.paginationTotalItems / this.pageSize)) {
        this.pagination.page.current = Number(page);
      } else if (page.trim() !== '' && page.length >= this.pageLength) {
        this.notificationService.error('Invalid page entered.', 'Invalid page.');
      }
      this.pageLength = page.length;
    });

    const patient = this.route.snapshot.paramMap.get('id');
    const publicPatient = this.route.snapshot.paramMap.get('patientId');
    if (patient != null) {
      this.patientsService.getPatient(patient).subscribe(patientFound => {
        this.idSpace = patientFound.idSpace;
        this.patientToFind = publicPatient;
        this.searchPatient();
      });
    } else {
      this.pagination.page.current = 1;
      this.getPageExplorations();
    }
    this.idSpacesService.getIdSpaces().subscribe(idSpaces => this.idSpaces = idSpaces);
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
            patient: patient
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

  public patientIdAreCorrect(): Boolean {
    if (this.editingExploration || (this.patientId != null || this.patientId !== undefined)) {
      return true;
    }
    return false;
  }

  public IdSpaceAreCorrect(): Boolean {
    if (this.editingExploration || this.idSpace != null || this.idSpace !== undefined) {
      return true;
    }
    return false;
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
    (<HTMLInputElement>document.getElementById('page-to-go')).value = '1';
    this.pagination.page.current = 1;
    this.paginatePatientExplorations = true;
    this.getPageExplorations();
  }

  clear() {
    this.patientToFind = '';
    this.idSpace = new IdSpace();
    this.idSpaceToFind = new IdSpace();
    this.paginatePatientExplorations = false;
    (<HTMLInputElement>document.getElementById('page-to-go')).value = '1';
    this.pagination.page.current = 1;
    this.getPageExplorations();
  }
}

