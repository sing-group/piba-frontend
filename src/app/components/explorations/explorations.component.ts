import {Component, OnInit} from '@angular/core';
import {ClrDatagridComparatorInterface} from '@clr/angular';
import {ExplorationsService} from '../../services/explorations.service';
import Exploration from '../../models/Exploration';
import Patient from '../../models/Patient';
import {PatientsService} from '../../services/patients.service';

class ExplorationComparator implements ClrDatagridComparatorInterface<Exploration> {
  compare(exploration1: Exploration, exploration2: Exploration) {
    return new Date(exploration1.date).getTime() - new Date(exploration2.date).getTime();
  }
}

@Component({
  selector: 'app-explorations',
  templateUrl: './explorations.component.html',
  styleUrls: ['./explorations.component.css']
})

export class ExplorationsComponent implements OnInit {

  explorations: Exploration[] = [];

  editingExploration: Boolean;
  creatingExploration: Boolean;
  date: string;
  location: string;
  newExploration: Exploration;
  exploration: Exploration = new Exploration();

  patientsFound: Patient[];
  patientIdStartsWith: string;
  patient: Patient = new Patient();
  selectedPatientId: Boolean = false;

  // needed to sort by date in the explorations table
  readonly explorationComparator = new ExplorationComparator();

  constructor(private explorationsService: ExplorationsService, private patientsService: PatientsService) {
  }

  ngOnInit() {
    this.explorationsService.getExplorations().subscribe(explorations => this.explorations = explorations);
  }

  edit(id: string) {
    this.exploration = this.explorations.find((exploration) => exploration.id === id);
    this.date = new Date(this.exploration.date).toLocaleDateString();
    this.location = this.exploration.location;
    this.editingExploration = true;
    this.creatingExploration = false;
  }

  save() {
    if (!this.editingExploration) {
      this.newExploration = {
        id: null,
        date: new Date(this.date),
        location: this.location,
        videos: [],
        polyps: [],
        patient: this.patient
      };
      this.explorationsService.createExploration(this.newExploration)
        .subscribe(newExploration => this.explorations = this.explorations.concat(newExploration));
    } else {

      this.exploration.location = this.location;
      this.exploration.date = new Date(this.date);
      this.explorationsService.editExploration(this.exploration).subscribe(updatedExploration => {
        Object.assign(this.explorations.find((exploration) => exploration.id === this.exploration.id), updatedExploration);
      });
    }
    this.cancel();
  }

  cancel() {
    this.date = null;
    this.location = null;
    this.creatingExploration = false;
    this.editingExploration = false;
    this.patientsFound = null;
    this.patientIdStartsWith = null;
  }

  delete(id: string) {
    this.explorationsService.delete(id).subscribe(() => {
        const index = this.explorations.indexOf(
          this.explorations.find((exploration) => exploration.id === id
          )
        );
        this.explorations.splice(index, 1);
      }
    );
  }

  filterPatient() {
    if (this.patientIdStartsWith.length > 3) {
      this.patientsService.searchPatientsBy(this.patientIdStartsWith).subscribe(patients => this.patientsFound = patients);
      this.selectedPatientId = false;
    } else {
      this.patientsFound = null;
    }
  }

  selectedPatient(patient: Patient) {
    this.patient = patient;
    this.patientIdStartsWith = this.patient.patientID;
    this.selectedPatientId = true;
  }

  public patientIdAreCorrect(): Boolean {
    return this.patientsFound != null && this.patientsFound.includes(this.patient);
  }

}

