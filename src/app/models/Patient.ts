import Exploration from "./Exploration";

export default class Patient {
    id: string;
    patientID: string;
    sex: SEX;
    birthdate: Date;
    explorations: Exploration[];
}

export enum SEX {
    MALE = 'Male', FEMALE = 'Female'
}