import { Injectable } from '@angular/core';

import Patient, { SEX } from '../models/Patient';
import { Observable } from 'rxjs/Observable';
import PatientInfo from './entities/PatientInfo';

import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EnumUtils } from '../utils/enum.utils';

@Injectable()
export class PatientsService {

  constructor(private http: HttpClient) { }

  createPatient(patient: Patient): Observable<Patient> {
    const patientInfo = this.toPatientInfo(patient);

    return this.http.post<PatientInfo>(`${environment.restApi}/patient`, patientInfo).map(this.mapPatientInfo.bind(this));
  }

  getPatient(id: String): Observable<Patient> {
    return this.http.get<PatientInfo>(`${environment.restApi}/patient/${id}`).map(this.mapPatientInfo.bind(this));
  }

  getPatientID(patientID: String): Observable<Patient> {
    return this.http.get<PatientInfo>(`${environment.restApi}/patient/patientID/${patientID}`).map(this.mapPatientInfo.bind(this));
  }

  private toPatientInfo(patient: Patient): PatientInfo {
    const enumUtils = new EnumUtils;
    return {
      id: patient.id,
      patientID: patient.patientID,
      sex: enumUtils.findKeyForValue(SEX, patient.sex),
      birthdate: new Date(patient.birthdate)
    };
  }

  private mapPatientInfo(patientInfo: PatientInfo): Patient {
    return {
      id: patientInfo.id,
      patientID: patientInfo.patientID,
      sex: SEX[patientInfo.sex],
      birthdate: patientInfo.birthdate
    };
  }

  searchPatientsBy(patientIdStartsWith: string): Observable<Patient[]> {
    let params = new HttpParams();
    params = params.append('patientIdStartsWith', patientIdStartsWith);
    return this.http.get<PatientInfo[]>(`${environment.restApi}/patient`, { params })
      .map(patientsInfo => patientsInfo.map(this.mapPatientInfo));
  }

  editPatient(patient: Patient): Observable<Patient> {
    const patientInfo = this.toPatientInfo(patient);

    return this.http.put<PatientInfo>(`${environment.restApi}/patient`, patientInfo).map(this.mapPatientInfo.bind(this));
  }

  deletePatient(id: string) {
    return this.http.delete(`${environment.restApi}/patient/${id}`);
  }
}

