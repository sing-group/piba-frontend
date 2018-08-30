import { Component, OnInit } from '@angular/core';
import Patient, { SEX } from '../../models/Patient';
import { PatientsService } from '../../services/patients.service';
import { EnumUtils } from '../../utils/enum.utils';

@Component({
  selector: 'app-patient',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {

  creatingPatient: Boolean = false;
  editingPatient: Boolean = false;

  patients: Patient[] = [];
  newPatient: Patient = new Patient();

  SEX = SEX;
  SEXValues: SEX[];

  patientIDText: string;
  patient: Patient;
  error: string;

  patientID: string;
  birthdate: string;
  sex: SEX;

  constructor(private patientsService: PatientsService) { }

  ngOnInit() {
    let enumUtils = new EnumUtils();
    this.SEXValues = enumUtils.enumValues(SEX);
  }

  save() {
    if (this.creatingPatient) {
      this.newPatient = {
        id: null,
        patientID: this.patientID,
        birthdate: new Date(this.birthdate),
        sex: this.sex
      }
      this.patientsService.createPatient(this.newPatient).subscribe(newPatient =>
        this.patients = this.patients.concat(newPatient)
      );
    } else {
      this.patient.birthdate = new Date(this.birthdate);
      this.patient.sex = this.sex;
      this.patient.patientID = this.patientID;
      this.patientsService.editPatient(this.patient).subscribe(updatedPatient =>
        Object.assign(this.patient, updatedPatient)
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
    this.patientIDText = null;
  }

  findPatientID() {
    this.patientsService.getPatientID(this.patientIDText).subscribe(
      patient => { this.patient = patient; this.error = null; },
      error => { this.error = error.error; this.patient = null; }
    );
  }

  edit() {
    this.editingPatient = true;
    this.sex = this.patient.sex;
    this.birthdate = new Date(this.patient.birthdate).toLocaleDateString();
    this.patientID = this.patient.patientID;
  }

  delete() {
    this.patientsService.deletePatient(this.patient.id).subscribe(() => this.patient = null);
  }

}
