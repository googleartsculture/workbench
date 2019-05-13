import { NgModule } from '@angular/core';
import { NotificationsComponent } from './notifications.component';
import { NotificationsService } from './notifications.service';
import { CommonModule } from '@angular/common';
import { SvgModule } from '../../shared/svg/svg.module';

@NgModule({
  imports: [
    CommonModule,
    SvgModule
  ],
  declarations: [
    NotificationsComponent,
  ],
  providers: [
    NotificationsService,
  ],
  exports: [
    NotificationsComponent,
  ],
})
export class NotificationsModule {}
