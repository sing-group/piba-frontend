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

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PolypDataset} from '../../models/PolypDataset';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {GalleriesService} from '../../services/galleries.service';

@Component({
  selector: 'app-edit-polyp-dataset-dialog',
  templateUrl: './edit-polyp-dataset-dialog.component.html',
  styleUrls: ['./edit-polyp-dataset-dialog.component.css']
})
export class EditPolypDatasetDialogComponent implements OnInit {
  private _open: boolean;
  @Output() public openChange = new EventEmitter<boolean>();

  @Input() public _dataset: PolypDataset;

  @Output() public create = new EventEmitter<PolypDataset>();

  // Polyp dataset data
  public formGroup: FormGroup;

  public galleryOptions: { id: string, title: string }[] = [];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly galleriesService: GalleriesService
  ) {}

  ngOnInit() {
    this.galleriesService.listGalleries()
      .subscribe(galleries => {
        this.galleryOptions.push({id: null, title: '<None>'});
        galleries
          .sort((g1, g2) => g1.title.localeCompare(g2.title))
          .forEach(gallery => this.galleryOptions.push(gallery));
      });

    this.formGroup = this.formBuilder.group({
      title: ['', Validators.required],
      gallery: [null]
    });
  }

  @Input() public set open(open: boolean) {
    if (open !== this._open) {
      this._open = open;
      this.openChange.emit(this._open);
    }
  }

  public get open(): boolean {
    return this._open;
  }

  @Input() set dataset(dataset: PolypDataset) {
    if (this._dataset !== dataset) {
      this._dataset = dataset;

      if (Boolean(dataset)) {
        let galleryId = null;
        if (Boolean(this.dataset.defaultGallery)) {
          galleryId = typeof this.dataset.defaultGallery === 'string'
            ? this.dataset.defaultGallery : this.dataset.defaultGallery.id;
        }

        this.formGroup = this.formBuilder.group({
          title: [this.dataset.title, Validators.required],
          gallery: [galleryId]
        });
      } else {
        this.formGroup = this.formBuilder.group({
          title: ['', Validators.required],
          gallery: [null]
        });
      }
    }
  }

  get dataset(): PolypDataset {
    return this._dataset;
  }

  public isEditing(): boolean {
    return Boolean(this.dataset);
  }

  public isValid(): boolean {
    return this.formGroup.valid;
  }

  public submit(): void {
    if (this.isValid()) {
      this.create.emit({
        id: this.isEditing() ? this.dataset.id : null,
        title: this.formGroup.get('title').value,
        polyps: this.isEditing() ? this.dataset.polyps : [],
        defaultGallery: this.formGroup.get('gallery').value
      });

      this.closeAndClear();
    }
  }

  public cancel(): void {
    this.create.emit(null);

    this.closeAndClear();
  }

  private closeAndClear(): void {
    this.formGroup.reset();
    this.formGroup.clearValidators();

    this.open = false;
  }
}
