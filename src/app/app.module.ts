import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { TabViewModule } from 'primeng/tabview';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { ExplorationComponent } from './exploration/exploration.component';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { VideoComponent } from './video/video.component';
import { AppRoutingModule } from './/app-routing.module';
import { DialogModule } from 'primeng/dialog';

@NgModule({
  declarations: [
    AppComponent,
    ExplorationComponent,
    VideoComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FieldsetModule,
    InputTextModule,
    TabViewModule,
    DataViewModule,
    ButtonModule,
    DropdownModule,
    FormsModule,
    FileUploadModule,
    CardModule,
    PanelModule,
    AppRoutingModule,
    DialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
