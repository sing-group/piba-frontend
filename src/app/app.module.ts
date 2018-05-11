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

@NgModule({
  declarations: [
    AppComponent,
    ExplorationComponent,
    VideoComponent,
    PatientComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    ClarityModule
  ],
  providers: [
    PolypsService,
    VideosService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
