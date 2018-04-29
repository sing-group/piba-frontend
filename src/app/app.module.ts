import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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


@NgModule({
  declarations: [
    AppComponent,
    ExplorationComponent
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
    RouterModule.forRoot([
      {
        path: 'exploration', component: ExplorationComponent
      },
      {
        path: '', redirectTo: 'exploration', pathMatch: 'full'
      }
    ]),
    CardModule,
    PanelModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
