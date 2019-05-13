import { TranslateModule } from '@ngx-translate/core';
import { SvgModule } from './../../shared/svg/svg.module';
import { NgModule } from '@angular/core';
import { PortraitNoticeComponent } from './portrait-notice.component';

@NgModule({
  imports: [
    SvgModule,
    TranslateModule,
  ],
  declarations: [
    PortraitNoticeComponent,
  ],
  exports: [
    PortraitNoticeComponent,
  ],
})
export class PortraitNoticeModule {}
