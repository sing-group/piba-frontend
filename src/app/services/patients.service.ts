import {Injectable} from '@angular/core';

import Patient, {SEX} from '../models/Patient';
import {Observable} from 'rxjs';
import PatientInfo from './entities/PatientInfo';

import {environment} from '../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {EnumUtils} from '../utils/enum.utils';
import {concatMap, map} from 'rxjs/operators';
import {IdSpacesService} from './idspaces.service';

@Injectable()
export class PatientsService {

  constructor(private http: HttpClient, private idSpacesService: IdSpacesService) {
  }

  createPatient(patient: Patient): Observable<Patient> {
    const patientInfo = this.toPatientInfo(patient);

    return this.withIdSpace(this.http.post<PatientInfo>(`${environment.restApi}/patient`, patientInfo));
  }

  getPatient(id: String): Observable<Patient> {
    return this.withIdSpace(this.http.get<PatientInfo>(`${environment.restApi}/patient/${id}`));
  }

  getPatientID(patientID: String): Observable<Patient> {
    return this.withIdSpace(this.http.get<PatientInfo>(`${environment.restApi}/patient/patientID/${patientID}`));
  }

  searchPatientsBy(patientIdStartsWith: string, idSpace: string): Observable<Patient[]> {
    let params = new HttpParams();
    params = params.append('patientIdStartsWith', patientIdStartsWith).append('idSpace', idSpace);

    return this.http.get<PatientInfo[]>(`${environment.restApi}/patient`, {params})
      .pipe(
        map(patientsInfo => patientsInfo.map(this.mapPatientInfo))
      );
  }

  editPatient(patient: Patient): Observable<Patient> {
    const patientInfo = this.toPatientInfo(patient);

    return this.withIdSpace(this.http.put<PatientInfo>(`${environment.restApi}/patient`, patientInfo));
  }

  deletePatient(id: string) {
    return this.http.delete(`${environment.restApi}/patient/${id}`);
  }

  private toPatientInfo(patient: Patient): PatientInfo {
    const enumUtils = new EnumUtils;
    return {
      id: patient.id,
      patientID: patient.patientID,
      sex: enumUtils.findKeyForValue(SEX, patient.sex),
      birthdate: new Date(patient.birthdate),
      idSpace: patient.idSpace.id
    };
  }

  private mapPatientInfo(patientInfo: PatientInfo): Patient {
    return {
      id: patientInfo.id,
      patientID: patientInfo.patientID,
      sex: SEX[patientInfo.sex],
      birthdate: patientInfo.birthdate,
      idSpace: null
    };
  }

  private withIdSpace(patientInfoObservable: Observable<PatientInfo>): Observable<Patient> {
    return patientInfoObservable.pipe(
      concatMap(patientInfo => {
          if (typeof patientInfo.idSpace === 'string') {
            throw new TypeError('patientInfo.idSpace must be an IdAndUri');
          }
          return this.idSpacesService.getIdSpace(patientInfo.idSpace.id)
            .pipe(
              map(idspace => {
                const patient = this.mapPatientInfo(patientInfo);
                patient.idSpace = idspace;
                return patient;
              })
            );
        }
      ));
  }
}

