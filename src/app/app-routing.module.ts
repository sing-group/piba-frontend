import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ExplorationComponent} from './components/exploration/exploration.component';
import {VideoEditorComponent} from './components/video-editor/video-editor.component';
import {PatientsComponent} from './components/patients/patients.component';
import {ExplorationsComponent} from './components/explorations/explorations.component';
import {LoginComponent} from './components/login/login.component';
import {AuthGuard} from './guards/authGuard';
import {IdspaceComponent} from './components/idspace/idspace.component';
import {UserComponent} from './components/user/user.component';
import {GalleryComponent} from './components/gallery/gallery.component';
import {ImageComponent} from './components/image/image.component';
import {ProfileComponent} from './components/profile/profile.component';
import {GalleriesComponent} from './components/galleries/galleries.component';
import {ModifiersComponent} from './components/modifiers/modifiers.component';

const routes: Routes = [
  {
    path: 'modifiers', component: ModifiersComponent, canActivate: [AuthGuard]
  },
  {
    path: 'galleries', component: GalleriesComponent, canActivate: [AuthGuard]
  },
  {
    path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]
  },
  {
    path: 'gallery/:id', component: GalleryComponent, canActivate: [AuthGuard]
  },
  {
    path: 'gallery/:gallery_id/image/:id', component: ImageComponent, canActivate: [AuthGuard]
  },
  {
    path: 'users', component: UserComponent, canActivate: [AuthGuard]
  },
  {
    path: 'idspace', component: IdspaceComponent, canActivate: [AuthGuard]
  },
  {
    path: 'patients', component: PatientsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'explorations/:id', component: ExplorationComponent, canActivate: [AuthGuard]
  },
  {
    path: 'explorations/:patientId/:id', component: ExplorationsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'explorations', component: ExplorationsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'video/:id', component: VideoEditorComponent, canActivate: [AuthGuard]
  },
  {
    path: 'login', component: LoginComponent
  },
  {
    path: 'loginrecovery', component: LoginComponent
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
export class AppRoutingModule {
}
