/*
 *  PIBA Frontend
 *
 * Copyright (C) 2018-2020 - Miguel Reboiro-Jato,
 * Daniel Glez-Peña, Alba Nogueira Rodríguez, Florentino Fdez-Riverola,
 * Rubén Domínguez Carbajales, Jesús Miguel Herrero Rivas,
 * Eloy Sánchez Hernández, Laura Rivas Moral,
 * Manuel Puga Jiménez de Azcárate, Joaquín Cubiella Fernández,
 * Hugo López-Fernández, Silvia Rodríguez Iglesias, Fernando Campos Tato.
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {Component, OnInit} from '@angular/core';
import {Patient, SEX} from '../../models/Patient';
import {PatientsService} from '../../services/patients.service';
import {EnumUtils} from '../../utils/enum.utils';
import {IdSpace} from '../../models/IdSpace';
import {IdSpacesService} from '../../services/idspaces.service';
import {NotificationService} from '../../modules/notification/services/notification.service';

@Component({
  selector: 'app-patient',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {

  creatingPatient = false;
  editingPatient = false;
  deletingPatient = false;

  newPatient: Patient = new Patient();

  SEXValues: SEX[];

  patientIDText: string;
  patient: Patient;

  patientID: string;
  birthdate: string;
  sex: SEX;

  idSpaces: IdSpace[];
  idSpace: IdSpace;
  idSpaceToFind: IdSpace;

  constructor(private patientsService: PatientsService,
              private idSpacesService: IdSpacesService,
              private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.SEXValues = EnumUtils.enumValues(SEX);
    this.idSpacesService.getIdSpaces().subscribe((idSpaces) => this.idSpaces = idSpaces);
  }

  save() {
    if (this.creatingPatient) {
      this.newPatient = {
        id: null,
        patientID: this.patientID,
        birthdate: new Date(this.birthdate),
        sex: this.sex,
        idSpace: this.idSpace
      };
      this.patientsService.createPatient(this.newPatient).subscribe(() =>
        this.notificationService.success('Patient registered successfully.', 'Patient registered.')
      );
    } else {
      this.patient.birthdate = new Date(this.birthdate);
      this.patient.sex = this.sex;
      this.patient.patientID = this.patientID;
      this.patient.idSpace = this.idSpace;
      this.patientsService.editPatient(this.patient).subscribe(() =>
        this.notificationService.success('Patient edited successfully.', 'Patient edited.')
      );
    }
    this.cancel();
  }

  cancel() {
    this.newPatient = new Patient();
    this.creatingPatient = false;
    this.editingPatient = false;
    this.deletingPatient = false;
    this.patientID = null;
    this.birthdate = null;
    this.sex = null;
    this.idSpace = null;
  }

  findPatientID() {
    this.patientsService.getPatientID(this.patientIDText, this.idSpaceToFind.id).subscribe(
      patient => {
        this.patient = patient;
        this.patient.patientID = this.patientIDText;
      }
    );
  }

  edit() {
    this.editingPatient = true;
    this.sex = this.patient.sex;
    this.birthdate = new Date(this.patient.birthdate).toLocaleDateString();
    this.patientID = this.patient.patientID;
    this.idSpace = this.idSpaces.find((idspace) => idspace.name === this.patient.idSpace.name);
  }

  delete() {
    this.patientsService.deletePatient(this.patient.id).subscribe(() => {
      this.patient = null;
      this.notificationService.success('Patient removed successfully.', 'Patient removed.');
    });
    this.cancel();
  }
}
