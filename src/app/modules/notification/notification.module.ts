import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ModuleWithProviders} from '@angular/compiler/src/core';
import {NotificationService} from './services/notification.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
export class NotificationModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: NotificationModule,
      providers: [
        NotificationService
      ]
    };
  }
}
