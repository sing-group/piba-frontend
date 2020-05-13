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

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ExplorationComponent} from './components/exploration/exploration.component';
import {VideoEditorComponent} from './components/video-editor/video-editor.component';
import {PatientsComponent} from './components/patients/patients.component';
import {ExplorationsComponent} from './components/explorations/explorations.component';
import {LoginComponent} from './components/login/login.component';
import {AuthGuard} from './guards/authGuard';
import {IdspaceComponent} from './components/idspace/idspace.component';
import {UserComponent} from './components/user/user.component';
import {GalleryComponent} from './components/gallery/gallery.component';
import {ImageComponent} from './components/image/image.component';
import {ProfileComponent} from './components/profile/profile.component';
import {GalleriesComponent} from './components/galleries/galleries.component';
import {ModifiersComponent} from './components/modifiers/modifiers.component';
import {PolypsComponent} from './components/polyps/polyps.component';
import {PolypDatasetsComponent} from './components/polyp-datasets/polyp-datasets.component';
import {PolypDatasetComponent} from './components/polyp-dataset/polyp-dataset.component';
import {PolypRecordingInGalleryComponent} from './components/polyp-recording-in-gallery/polyp-recording-in-gallery.component';

const routes: Routes = [
  {
    path: 'modifiers', component: ModifiersComponent, canActivate: [AuthGuard]
  },
  {
    path: 'galleries', component: GalleriesComponent, canActivate: [AuthGuard]
  },
  {
    path: 'polyps', component: PolypsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'polypdatasets', component: PolypDatasetsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'polypdatasets/:id', component: PolypDatasetComponent, canActivate: [AuthGuard]
  },
  {
    path: 'polypdatasets/:datasetId/polyprecording/:id', component: PolypRecordingInGalleryComponent, canActivate: [AuthGuard]
  },
  {
    path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]
  },
  {
    path: 'gallery/:id', component: GalleryComponent, canActivate: [AuthGuard]
  },
  {
    path: 'gallery/:gallery_id/image/:id', component: ImageComponent, canActivate: [AuthGuard]
  },
  {
    path: 'users', component: UserComponent, canActivate: [AuthGuard]
  },
  {
    path: 'idspace', component: IdspaceComponent, canActivate: [AuthGuard]
  },
  {
    path: 'patients', component: PatientsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'explorations/:id', component: ExplorationComponent, canActivate: [AuthGuard]
  },
  {
    path: 'explorations/:patientId/:id', component: ExplorationsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'explorations', component: ExplorationsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'video/:id', component: VideoEditorComponent, canActivate: [AuthGuard]
  },
  {
    path: 'login', component: LoginComponent
  },
  {
    path: 'loginrecovery', component: LoginComponent
  },
  {
    path: '', redirectTo: 'explorations', pathMatch: 'full'
  }];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule {
}
