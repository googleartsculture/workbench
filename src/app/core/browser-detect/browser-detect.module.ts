import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrowserDetectComponent } from './browser-detect.component';
import { BrowserDetectService } from './browser-detect.service';
import { SvgModule } from '../../shared/svg/svg.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    SvgModule,
    TranslateModule,
  ],
  declarations: [
    BrowserDetectComponent,
  ],
  providers: [
    BrowserDetectService,
  ],
  exports: [
    BrowserDetectComponent,
  ]
})

export class BrowserDetectModule {}
