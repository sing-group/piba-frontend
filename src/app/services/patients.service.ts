import { Injectable } from '@angular/core';

import Patient, { SEX } from '../models/Patient';
import { Observable } from 'rxjs';
import PatientInfo from './entities/PatientInfo';

import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { EnumUtils } from '../utils/enum.utils';

@Injectable()
export class PatientsService {

  constructor(private http: HttpClient) { }

  createPatient(patient: Patient): Observable<Patient> {
    let patientInfo = this.toPatientInfo(patient);

    return this.http.post<PatientInfo>(`${environment.restApi}/patient`, patientInfo).map(this.mapPatientInfo.bind(this));
  }

  private toPatientInfo(patient: Patient): PatientInfo {
    let enumUtils = new EnumUtils;
    return {
      id: patient.id,
      patientID: patient.patientID,
      sex: enumUtils.findKeyForValue(SEX, patient.sex),
      birthdate: new Date(patient.birthdate)
    }
  }

  private mapPatientInfo(patientInfo: PatientInfo): Patient {
    return {
      id: patientInfo.id,
      patientID: patientInfo.patientID,
      sex: SEX[patientInfo.sex],
      birthdate: patientInfo.birthdate
    }
  }
}

