import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { ClarityModule } from '@clr/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ExplorationComponent } from './components/exploration/exploration.component';
import { VideoComponent } from './components/video/video.component';
import { PatientComponent } from './components/patient/patient.component';
import { PolypsService } from './services/polyps.service';
import { VideosService } from './services/videos.service';
import { VideoEditorComponent } from './components/video-editor/video-editor.component';
import { TimePipe } from './pipes/time.pipe';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    ExplorationComponent,
    VideoComponent,
    PatientComponent,
    VideoEditorComponent,
    TimePipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    ClarityModule
  ],
  providers: [
    PolypsService,
    VideosService,
    TimePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
