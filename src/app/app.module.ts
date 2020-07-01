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

import {ErrorHandler, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {ClarityModule, ClrFormsNextModule} from '@clr/angular';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {ExplorationComponent} from './components/exploration/exploration.component';
import {VideoComponent} from './components/video/video.component';
import {PatientsComponent} from './components/patients/patients.component';
import {PolypsService} from './services/polyps.service';
import {VideosService} from './services/videos.service';
import {ExplorationsService} from './services/explorations.service';
import {DropdownFilterPipe, VideoEditorComponent} from './components/video-editor/video-editor.component';
import {TimePipe} from './pipes/time.pipe';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {ExplorationsComponent} from './components/explorations/explorations.component';
import {PolypComponent} from './components/polyp/polyp.component';
import {PolypRecordingsService} from './services/polyprecordings.service';
import {PatientsService} from './services/patients.service';
import {IdSpacesService} from './services/idspaces.service';
import {ModifiersService} from './services/modifiers.service';
import {VideoModificationsService} from './services/video-modifications.service';
import {TimeToNumberPipe} from './pipes/time-to-number.pipe';
import {NotificationModule} from './modules/notification/notification.module';
import {ErrorNotificationHandler} from './modules/notification/handlers/error-notification.handler';
import {LoginComponent} from './components/login/login.component';
import {AuthenticationInterceptor} from './helpers/authentication.interceptor';
import {AgePipe} from './pipes/age.pipe';
import {SimpleNotificationsModule} from 'angular2-notifications';
import {IdspaceComponent} from './components/idspace/idspace.component';
import {UserComponent} from './components/user/user.component';
import {DeleteConfirmationComponent} from './components/delete-confirmation/delete-confirmation.component';
import {GalleryComponent} from './components/gallery/gallery.component';
import {SafehtmlPipe} from './pipes/safehtml.pipe';
import {ImageComponent} from './components/image/image.component';
import {ProfileComponent} from './components/profile/profile.component';
import {GalleriesComponent} from './components/galleries/galleries.component';
import {ModifiersComponent} from './components/modifiers/modifiers.component';
import {ConfirmationModalComponent} from './components/confirmation-modal/confirmation-modal.component';
import {VideoZoneEditorComponent} from './components/video-zone-editor/video-zone-editor.component';
import {PolypsComponent} from './components/polyps/polyps.component';
import {PolypDatasetsComponent} from './components/polyp-datasets/polyp-datasets.component';
import {PolypDatasetsService} from './services/polyp-datasets.service';
import {PolypDatasetComponent} from './components/polyp-dataset/polyp-dataset.component';
import {PolypRecordingInDatasetComponent} from './components/polyp-recording-in-dataset/polyp-recording-in-dataset.component';
import {ImageAnnotatorComponent} from './components/image-annotator/image-annotator.component';
import {
  ContinueWithoutSavingLocationDialogComponent
} from './components/image/continue-without-saving-location-dialog/continue-without-saving-location-dialog.component';
import {
  ConfirmRemovingLocationDialogComponent
} from './components/image/confirm-removing-location-dialog/confirm-removing-location-dialog.component';
import {
  DescribePolypDeletionDialogComponent
} from './components/image/describe-polyp-deletion-dialog/describe-polyp-deletion-dialog.component';
import {
  LocatePolypInImageDialogComponent
} from './components/locate-polyp-in-image-dialog/locate-polyp-in-image-dialog.component';
import { PolypInfoComponent } from './components/polyp-info/polyp-info.component';
import { EditPolypDatasetDialogComponent } from './components/edit-polyp-dataset-dialog/edit-polyp-dataset-dialog.component';
import {MarkdownModule} from 'ngx-markdown';

@NgModule({
    declarations: [
        AppComponent,
        ExplorationComponent,
        VideoComponent,
        PatientsComponent,
        VideoEditorComponent,
        TimePipe,
        ExplorationsComponent,
        PolypComponent,
        TimeToNumberPipe,
        LoginComponent,
        AgePipe,
        IdspaceComponent,
        UserComponent,
        DeleteConfirmationComponent,
        GalleryComponent,
        SafehtmlPipe,
        ImageComponent,
        ProfileComponent,
        GalleriesComponent,
        ModifiersComponent,
        DropdownFilterPipe,
        VideoZoneEditorComponent,
        ConfirmationModalComponent,
        PolypsComponent,
        PolypDatasetsComponent,
        PolypDatasetComponent,
        PolypRecordingInDatasetComponent,
        ImageAnnotatorComponent,
        ContinueWithoutSavingLocationDialogComponent,
        ConfirmRemovingLocationDialogComponent,
        DescribePolypDeletionDialogComponent,
        LocatePolypInImageDialogComponent,
        PolypInfoComponent,
        EditPolypDatasetDialogComponent
    ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    ClarityModule,
    ClrFormsNextModule,
    ReactiveFormsModule,
    SimpleNotificationsModule.forRoot({
      timeOut: 5000,
      preventDuplicates: true
    }),
    NotificationModule.forRoot(),
    MarkdownModule.forRoot()
  ],
  providers: [
    PolypsService,
    PolypDatasetsService,
    VideosService,
    TimePipe,
    ExplorationsService,
    PolypRecordingsService,
    PatientsService,
    IdSpacesService,
    ModifiersService,
    VideoModificationsService,
    TimeToNumberPipe,
    {
      provide: ErrorHandler,
      useClass: ErrorNotificationHandler
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthenticationInterceptor, multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
