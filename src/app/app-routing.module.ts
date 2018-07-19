import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExplorationComponent } from './components/exploration/exploration.component';
import { VideoEditorComponent } from './components/video-editor/video-editor.component';
import { PatientComponent } from './components/patient/patient.component';

const routes: Routes = [
  {
    path: 'patients', component: PatientComponent
  },
  {
    path: 'explorations/:id', component: ExplorationComponent
  },
  {
    path: 'video/:id', component: VideoEditorComponent
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
export class AppRoutingModule { }
