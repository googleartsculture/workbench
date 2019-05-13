import { LoaderModule } from './../../../../shared/loader/loader.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacsimileDownloadModalComponent } from './facsimile-download-modal.component';
import { SvgModule } from './../../../../shared/svg/svg.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    FacsimileDownloadModalComponent,
  ],
  imports: [
    CommonModule,
    LoaderModule,
    NgxSmartModalModule.forRoot(),
    SvgModule,
    TranslateModule
  ],
  exports: [
    FacsimileDownloadModalComponent,
  ],
  providers: [],
})
export class FacsimileDownloadModalModule {}
