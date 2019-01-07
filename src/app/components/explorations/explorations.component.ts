import {Component, OnInit} from '@angular/core';
import {State} from '@clr/angular';
import {ExplorationsService} from '../../services/explorations.service';
import {Exploration} from '../../models/Exploration';
import {PatientsService} from '../../services/patients.service';
import {IdSpacesService} from '../../services/idspaces.service';
import {IdSpace} from '../../models/IdSpace';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-explorations',
  templateUrl: './explorations.component.html',
  styleUrls: ['./explorations.component.css']
})

export class ExplorationsComponent implements OnInit {

  explorations: Exploration[] = [];

  editingExploration = false;
  creatingExploration = false;
  deletingExploration = false;
  paginatePatientExplorations = false;
  date: string;
  location: string;
  title: string;
  newExploration: Exploration;
  exploration: Exploration = new Exploration();
  paginationTotalItems = 0;
  pageSize = 15;
  currentPage: number;

  patientId: string;
  patientError: string;

  idSpaces: IdSpace[];
  idSpace: IdSpace = new IdSpace();

  idSpaceToFind: IdSpace = new IdSpace();
  patientToFind = '';

  constructor(private explorationsService: ExplorationsService, private patientsService: PatientsService,
              private idSpacesService: IdSpacesService, private notificationService: NotificationService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    const patient = this.route.snapshot.paramMap.get('id');
    const publicPatient = this.route.snapshot.paramMap.get('patientId');
    if (patient != null) {
      this.patientsService.getPatient(patient).subscribe(patientFound => {
        this.idSpace = patientFound.idSpace;
        this.patientToFind = publicPatient;
        this.searchPatient();
      });
    } else {
      this.currentPage = 1;
      this.getPageExplorations();
    }
    this.idSpacesService.getIdSpaces().subscribe(idSpaces => this.idSpaces = idSpaces);
  }

  edit(id: string) {
    this.exploration = new Exploration();
    Object.assign(this.exploration, this.explorations.find((exploration) => exploration.id === id));
    this.date = new Date(this.exploration.date).toLocaleDateString();
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
            date: new Date(this.date),
            location: this.location,
            videos: [],
            polyps: [],
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
      this.exploration.date = new Date(this.date);
      this.explorationsService.editExploration(this.exploration).subscribe(updatedExploration => {
        Object.assign(this.explorations.find((exploration) => exploration.id === this.exploration.id), updatedExploration);
        this.notificationService.success('Exploration edited successfully.', 'Exploration edited.');
        this.getPageExplorations();
        this.cancel();
      });
    }
  }

  getPageExplorations() {
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
    });
  }

  // Return the explorations of a patient's current page
  getPageExplorationsByPatient() {
    this.explorationsService.getExplorationsBy(this.patientToFind, this.idSpaceToFind, this.currentPage, this.pageSize)
      .subscribe(explorationPage => {
        this.paginatePatientExplorations = true;
        this.paginationTotalItems = explorationPage.totalItems;
        this.explorations = explorationPage.explorations;
      });
  }

  // It is executed when the page is changed in the view
  refreshPage(state: State) {
    this.currentPage = (state.page.from / state.page.size) + 1;
    this.getPageExplorations();
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
    this.currentPage = 1;
    this.getPageExplorationsByPatient();
  }

  clear() {
    this.patientToFind = '';
    this.idSpace = new IdSpace();
    this.idSpaceToFind = new IdSpace();
    this.paginatePatientExplorations = false;
    this.getPageTotalExplorations();
  }
}

