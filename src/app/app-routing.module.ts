import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExplorationComponent } from './exploration/exploration.component';
import { VideoComponent } from './video/video.component';

const routes: Routes = [{
  path: 'exploration', component: ExplorationComponent
},
{
  path: 'video/:id', component: VideoComponent
},
{
  path: '', redirectTo: 'exploration', pathMatch: 'full'
}];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule { }
