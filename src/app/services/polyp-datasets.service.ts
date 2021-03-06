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

import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {concatMap, map} from 'rxjs/operators';
import {Observable} from 'rxjs/internal/Observable';
import {PolypDatasetPage} from './entities/PolypDatasetPage';
import {PolypDatasetInfo} from './entities/PolypDatasetInfo';
import {PolypDataset} from '../models/PolypDataset';
import {PolypInfo} from './entities/PolypInfo';
import {PolypsService} from './polyps.service';
import {PibaError} from '../modules/notification/entities';
import {PolypRecordingInfo} from './entities/PolypRecordingInfo';
import {PolypRecordingsService} from './polyprecordings.service';
import {PolypPage} from './entities/PolypPage';
import {PolypRecordingInDatasetPage} from './entities/PolypRecordingInDatasetPage';
import {of} from 'rxjs/internal/observable/of';
import {PolypRecordingBasicData} from '../models/PolypRecordingBasicData';
import {PolypDatasetEditionInfo} from './entities/PolypDatasetEditionInfo';
import {iif} from 'rxjs/internal/observable/iif';
import {defer} from 'rxjs/internal/observable/defer';
import {SortDirection} from './entities/SortDirection';
import {PolypRecordingInDatasetInfo} from './entities/PolypRecordingInDatasetInfo';
import {PolypRecordingInDatasetBasicData} from '../models/PolypRecordingInDatasetBasicData';

@Injectable()
export class PolypDatasetsService {
  constructor(
    private http: HttpClient,
    private polypRecordingsService: PolypRecordingsService
  ) { }

  private static mapPolypDatasetInfo(polypInfo: PolypDatasetInfo): PolypDataset {
    const polyps: string[] = [];

    if (polypInfo.polyps.length > 0) {
      for (const polyp of polypInfo.polyps) {
        polyps.push(typeof polyp === 'string' ? polyp : polyp.id);
      }
    }

    const gallery = Boolean(polypInfo.defaultGallery)
      ? typeof polypInfo.defaultGallery === 'string' ? polypInfo.defaultGallery : polypInfo.defaultGallery.id
      : null;

    return {
      id: polypInfo.id,
      title: polypInfo.title,
      description: polypInfo.description,
      polyps: polyps,
      defaultGallery: gallery
    };
  }

  private static toPolypDatasetEditionInfo(polypDataset: PolypDataset): PolypDatasetEditionInfo {
    const polyps: string[] = [];
    for (const polyp of polypDataset.polyps) {
      if (typeof polyp === 'string') {
        polyps.push(polyp);
      } else {
        polyps.push(polyp.id);
      }
    }

    return {
      title: polypDataset.title,
      description: polypDataset.description,
      polyps: polyps,
      defaultGallery: Boolean(polypDataset) && Boolean(polypDataset.defaultGallery)
        ? (typeof polypDataset.defaultGallery === 'string' ? polypDataset.defaultGallery : polypDataset.defaultGallery.id)
        : null
    };
  }

  getPolypDataset(id: string): Observable<PolypDataset> {
    return this.http.get<PolypDatasetInfo>(`${environment.restApi}/polypdataset/${id}`)
      .pipe(
        map(PolypDatasetsService.mapPolypDatasetInfo),
        PibaError.throwOnError(
          'Error retrieving polyp dataset',
          `Polyp dataset with id '${id}' could not be found.`
        )
      );
  }

  getPolypDatasets(page: number, pageSize: number): Observable<PolypDatasetPage> {
    const params = new HttpParams()
      .append('page', page.toString())
      .append('pageSize', pageSize.toString());

    return this.http.get<PolypDatasetInfo[]>(`${environment.restApi}/polypdataset`, {params, observe: 'response'})
      .pipe(
        map(response => ({
          totalItems: Number(response.headers.get('X-Pagination-Total-Items')),
          polypDatasets: response.body.map(PolypDatasetsService.mapPolypDatasetInfo)
        })),
        PibaError.throwOnError(
          'Error retrieving polyp datasets',
          `Polyp datasets in page ${page} (page size: ${pageSize}) could not be retrieved.`
        )
      );
  }

  getPolyps(id: string, page: number, pageSize: number): Observable<PolypPage> {
    const params = new HttpParams()
      .append('page', page.toString())
      .append('pageSize', pageSize.toString());

    return this.http.get<PolypInfo[]>(`${environment.restApi}/polypdataset/${id}/polyp`, {params, observe: 'response'})
      .pipe(
        map(response => ({
          totalItems: Number(response.headers.get('X-Pagination-Total-Items')),
          polyps: response.body.map(PolypsService.mapPolypInfo)
        })),
        PibaError.throwOnError(
          'Error retrieving polyps in dataset',
          `Polyps in dataset '${id}' in page ${page} (page size: ${pageSize}) could not be retrieved.`
        )
      );
  }

  listPolypRecordings(
    id: string, page?: number, pageSize?: number, sortFields?: { images: SortDirection }
  ): Observable<PolypRecordingInDatasetPage> {
    let params = new HttpParams();

    if (Boolean(page) && Boolean(pageSize)) {
      params = params
        .append('page', page.toString())
        .append('pageSize', pageSize.toString());
    }

    if (Boolean(sortFields)) {
      params = params.append('imagesSort', sortFields.images);
    }

    return this.http.get<PolypRecordingInDatasetInfo[]>(
      `${environment.restApi}/polypdataset/${id}/polyprecording`, { params, observe: 'response' }
    )
      .pipe(
        concatMap(response => iif(() => response.body.length > 0,
          defer(() =>
            this.polypRecordingsService.fillMultiplePolypAndVideo(of(response.body)).pipe(
              map(polypRecordingInfos => ({
                totalItems: Number(response.headers.get('X-Pagination-Total-Items')),
                polypRecordings: polypRecordingInfos.map((value, index) => ({
                  ...value,
                  reviewed: response.body[index].reviewed
                }))
              }))
            )
          ),
          of({
            totalItems: Number(response.headers.get('X-Pagination-Total-Items')),
            polypRecordings: []
          })
        )),
        PibaError.throwOnError(
          'Error retrieving polyp recordings in dataset',
          `Polyps recordings in dataset '${id}' in page ${page} (page size: ${pageSize}) could not be retrieved.`
        )
      );
  }

  listAllPolypRecordingBasicData(id: string, sortFields?: { images: SortDirection }): Observable<PolypRecordingInDatasetBasicData[]> {
    const options: {params?: HttpParams} = {};
    if (Boolean(sortFields)) {
      options.params = new HttpParams();
      options.params = options.params.append('imagesSort', sortFields.images);
    }

    return this.http.get<PolypRecordingInDatasetBasicData[]>(`${environment.restApi}/polypdataset/${id}/polyprecording`, options)
    .pipe(
      map(infos => infos.map(info => ({
        ...PolypRecordingsService.mapPolypRecordingBasicData(info),
        reviewed: info.reviewed
      }))),
      PibaError.throwOnError(
        'Error retrieving polyp recordings in dataset',
        `Polyps recordings in dataset '${id}' could not be retrieved.`
      )
    );
  }

  editPolypDataset(polypDataset: PolypDataset): Observable<PolypDataset> {
    return this.http.put<PolypDatasetInfo>(
      `${environment.restApi}/polypdataset/${polypDataset.id}`,
      PolypDatasetsService.toPolypDatasetEditionInfo(polypDataset)
    ).pipe(
      map(PolypDatasetsService.mapPolypDatasetInfo),
      PibaError.throwOnError(
        'Error editing polyp dataset',
        `Polyp dataset ${polypDataset.title} could not be edited.`
      )
    );
  }

  createPolypDataset(polypDataset: PolypDataset): Observable<PolypDataset> {
    return this.http.post<PolypDatasetInfo>(
      `${environment.restApi}/polypdataset`,
      PolypDatasetsService.toPolypDatasetEditionInfo(polypDataset)
    ).pipe(
      map(PolypDatasetsService.mapPolypDatasetInfo),
      PibaError.throwOnError(
        'Error creating polyp dataset',
        `Polyp dataset ${polypDataset.title} could not be created.`
      )
    );
  }

  deletePolypDataset(polypDatasetId: string): Observable<any> {
    return this.http.delete(`${environment.restApi}/polypdataset/${polypDatasetId}`)
    .pipe(
      PibaError.throwOnError(
        'Error deleting polyp dataset',
        `Polyp dataset with id '${polypDatasetId}' could not be deleted.`
      )
    );
  }

  markPolypDatasetAsReviewed(polypDatasetId: string, polypRecordingId: number): Observable<any> {
    return this.http.put(`${environment.restApi}/polypdataset/${polypDatasetId}/polyprecording/${polypRecordingId}/reviewed`, true)
      .pipe(
        PibaError.throwOnError(
          'Error marking polyp recording',
          `Polyp recording with id '${polypRecordingId}' could not be marked as reviewed in polyp dataset ${polypDatasetId}.`
        )
      );
  }
}
