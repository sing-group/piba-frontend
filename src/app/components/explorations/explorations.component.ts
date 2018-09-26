import {Component, OnInit} from '@angular/core';
import {ClrDatagridComparatorInterface} from '@clr/angular';
import {ExplorationsService} from '../../services/explorations.service';
import {Exploration} from '../../models/Exploration';
import {PatientsService} from '../../services/patients.service';
import {IdSpacesService} from '../../services/idspaces.service';
import {IdSpace} from '../../models/IdSpace';
import {NotificationService} from '../../modules/notification/services/notification.service';

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

  patientId: string;
  patientError: string;

  idSpaces: IdSpace[];
  idSpace: IdSpace;

  // needed to sort by date in the explorations table
  readonly explorationComparator = new ExplorationComparator();

  constructor(private explorationsService: ExplorationsService, private patientsService: PatientsService,
              private idSpacesService: IdSpacesService, private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.explorationsService.getExplorations().subscribe(explorations => this.explorations = explorations);
    this.idSpacesService.getIdSpaces().subscribe(idSpaces => this.idSpaces = idSpaces);
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
      this.patientsService.getPatientID(this.patientId, this.idSpace.id).subscribe(patient => {
          this.newExploration = {
            id: null,
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
              this.notificationService.success('Exploration registered.', 'Exploration registered successfully.');
              this.cancel();
            });
        }, error => {
          this.patientError = error;
        }
      );
    } else {
      this.exploration.location = this.location;
      this.exploration.date = new Date(this.date);
      this.explorationsService.editExploration(this.exploration).subscribe(updatedExploration => {
        Object.assign(this.explorations.find((exploration) => exploration.id === this.exploration.id), updatedExploration);
        this.notificationService.success('Exploration edited.', 'Exploration edited successfully.');
        this.cancel();
      });
    }
  }

  cancel() {
    this.date = null;
    this.location = null;
    this.creatingExploration = false;
    this.editingExploration = false;
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
        this.notificationService.success('Exploration removed.', 'Exploration removed successfully.');
      }
    );
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
}

