import {IdAndUri} from './IdAndUri';

export interface PatientInfo {
  id: string;
  patientID: string;
  sex: string;
  birthdate: Date;
  idSpace: string | IdAndUri;
}
