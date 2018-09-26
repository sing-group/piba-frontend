import {IdSpace} from './IdSpace';

export class Patient {
  id: string;
  patientID: string;
  sex: SEX;
  birthdate: Date;
  idSpace: IdSpace;
}

export enum SEX {
  MALE = 'Male', FEMALE = 'Female'
}
