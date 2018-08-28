import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ClarityModule } from '@clr/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ExplorationComponent } from './components/exploration/exploration.component';
import { VideoComponent } from './components/video/video.component';
import { PatientsComponent } from './components/patients/patients.component';
import { PolypsService } from './services/polyps.service';
import { VideosService } from './services/videos.service';
import { ExplorationsService } from './services/explorations.service';
import { VideoEditorComponent } from './components/video-editor/video-editor.component';
import { TimePipe } from './pipes/time.pipe';
import { HttpClientModule } from '@angular/common/http';
import { ExplorationsComponent } from './components/explorations/explorations.component';
import { PolypComponent } from './components/polyp/polyp.component';
import { PolypRecordingsService } from './services/polyprecordings.service';
import { PatientsService } from './services/patients.service';

@NgModule({
  declarations: [
    AppComponent,
    ExplorationComponent,
    VideoComponent,
    PatientsComponent,
    VideoEditorComponent,
    TimePipe,
    ExplorationsComponent,
    PolypComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    ClarityModule,
    ReactiveFormsModule
  ],
  providers: [
    PolypsService,
    VideosService,
    TimePipe,
    ExplorationsService,
    PolypRecordingsService,
    PatientsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
