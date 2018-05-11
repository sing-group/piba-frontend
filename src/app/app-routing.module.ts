import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExplorationComponent } from './components/exploration/exploration.component';
import { VideoComponent } from './components/video/video.component';
import { PatientComponent } from './components/patient/patient.component';

const routes: Routes = [
  {
    path: 'patients', component: PatientComponent
  },
  {
    path: 'explorations', component: ExplorationComponent
  },
  {
    path: 'video/:id', component: VideoComponent
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
