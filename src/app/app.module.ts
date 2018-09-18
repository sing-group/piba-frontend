import {ErrorHandler, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {ClarityModule} from '@clr/angular';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {ExplorationComponent} from './components/exploration/exploration.component';
import {VideoComponent} from './components/video/video.component';
import {PatientsComponent} from './components/patients/patients.component';
import {PolypsService} from './services/polyps.service';
import {VideosService} from './services/videos.service';
import {ExplorationsService} from './services/explorations.service';
import {VideoEditorComponent} from './components/video-editor/video-editor.component';
import {TimePipe} from './pipes/time.pipe';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {ExplorationsComponent} from './components/explorations/explorations.component';
import {PolypComponent} from './components/polyp/polyp.component';
import {PolypRecordingsService} from './services/polyprecordings.service';
import {PatientsService} from './services/patients.service';
import {IdSpacesService} from './services/idspaces.service';
import {ModifiersService} from './services/modifiers.service';
import {VideomodificationsService} from './services/videomodifications.service';
import {TimeToNumberPipe} from './pipes/time-to-number.pipe';
import {VideoModificationComponent} from './components/video-modification/video-modification.component';
import {NotificationModule} from './modules/notification/notification.module';
import {ErrorNotificationHandler} from './modules/notification/handlers/error-notification.handler';
import {LoginComponent} from './components/login/login.component';
import {AuthenticationInterceptor} from './helpers/authentication.interceptor';
import {AgePipe} from './pipes/age.pipe';
import {SimpleNotificationsModule} from 'angular2-notifications';
import { IdspaceComponent } from './components/idspace/idspace.component';

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
    VideoModificationComponent,
    LoginComponent,
    AgePipe,
    IdspaceComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    ClarityModule,
    ReactiveFormsModule,
    SimpleNotificationsModule.forRoot({
      timeOut: 5000,
      preventDuplicates: true
    }),
    NotificationModule.forRoot()
  ],
  providers: [
    PolypsService,
    VideosService,
    TimePipe,
    ExplorationsService,
    PolypRecordingsService,
    PatientsService,
    IdSpacesService,
    ModifiersService,
    VideomodificationsService,
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
