import {Component, OnInit} from '@angular/core';
import Patient, {SEX} from '../../models/Patient';
import {PatientsService} from '../../services/patients.service';
import {EnumUtils} from '../../utils/enum.utils';
import {IdSpace} from '../../models/IdSpace';
import {IdSpacesService} from '../../services/idspaces.service';
import {NotificationService} from '../../modules/notification/services/notification.service';

@Component({
  selector: 'app-patient',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {

  creatingPatient: Boolean = false;
  editingPatient: Boolean = false;

  newPatient: Patient = new Patient();

  SEX = SEX;
  SEXValues: SEX[];

  patientIDText: string;
  patient: Patient;

  patientID: string;
  birthdate: string;
  sex: SEX;

  idSpaces: IdSpace[];
  idSpace: IdSpace;
  idSpaceToFind: IdSpace;

  constructor(private patientsService: PatientsService,
              private idSpacesService: IdSpacesService,
              private notificationService: NotificationService) {
  }

  ngOnInit() {
    const enumUtils = new EnumUtils();
    this.SEXValues = enumUtils.enumValues(SEX);
    this.idSpacesService.getIdSpaces().subscribe((idSpaces) => this.idSpaces = idSpaces);
  }

  save() {
    if (this.creatingPatient) {
      this.newPatient = {
        id: null,
        patientID: this.patientID,
        birthdate: new Date(this.birthdate),
        sex: this.sex,
        idSpace: this.idSpace
      };
      this.patientsService.createPatient(this.newPatient).subscribe(() =>
        this.notificationService.success('Patient registered.', 'Patient registered successfully.')
      );
    } else {
      this.patient.birthdate = new Date(this.birthdate);
      this.patient.sex = this.sex;
      this.patient.patientID = this.patientID;
      this.patient.idSpace = this.idSpace;
      this.patientsService.editPatient(this.patient).subscribe(() =>
        this.notificationService.success('Patient edited.', 'Patient edited successfully.')
      );
    }
    this.cancel();
  }

  cancel() {
    this.newPatient = new Patient();
    this.creatingPatient = false;
    this.editingPatient = false;
    this.patientID = null;
    this.birthdate = null;
    this.sex = null;
    this.idSpace = null;
  }

  findPatientID() {
    this.patientsService.getPatientID(this.patientIDText, this.idSpaceToFind.id).subscribe(
      patient => {
        this.patient = patient;
        this.patient.patientID = this.patientIDText;
      }
    );
  }

  edit() {
    this.editingPatient = true;
    this.sex = this.patient.sex;
    this.birthdate = new Date(this.patient.birthdate).toLocaleDateString();
    this.patientID = this.patient.patientID;
    this.idSpace = this.idSpaces.find((idspace) => idspace.name === this.patient.idSpace.name);
  }

  delete() {
    this.patientsService.deletePatient(this.patient.id).subscribe(() => {
      this.patient = null;
      this.notificationService.success('Patient removed.', 'Patient removed successfully.');
    });
  }

}
