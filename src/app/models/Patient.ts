import Exploration from "./Exploration";

export default class Patient {
    id: string;
    patientID: string;
    sex: SEX;
    birthdate: Date;
}

export enum SEX {
    MALE = 'Male', FEMALE = 'Female'
}