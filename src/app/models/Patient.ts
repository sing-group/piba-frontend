import { IdSpace } from './IdSpace';

export default class Patient {
    id: string;
    patientID: string;
    sex: SEX;
    birthdate: Date;
    idSpace: IdSpace;
}

export enum SEX {
    MALE = 'Male', FEMALE = 'Female'
}
