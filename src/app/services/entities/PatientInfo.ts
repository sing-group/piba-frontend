import IdAndUri from "./IdAndUri";

export default interface PatientInfo {
    id: string;
    patientID: string;
    sex: string;
    birthdate: Date;
}