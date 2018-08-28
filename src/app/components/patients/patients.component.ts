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

  patients: Patient[] = [];
  newPatient: Patient = new Patient();

  SEX = SEX;
  SEXValues: SEX[];

  constructor(private patientsService: PatientsService) { }

  ngOnInit() {
    let enumUtils = new EnumUtils();
    this.SEXValues = enumUtils.enumValues(SEX);
  }

  save() {
    this.patientsService.createPatient(this.newPatient).subscribe(newPatient =>
      this.patients = this.patients.concat(newPatient)
    );
    this.cancel();
  }

  cancel() {
    this.newPatient = new Patient();
    this.creatingPatient = false;
  }

}
