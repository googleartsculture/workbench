import { LoaderModule } from '../../../../shared/loader/loader.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportDownloadModalComponent } from './export-download-modal.component';
import { SvgModule } from '../../../../shared/svg/svg.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ExportDownloadModalComponent,
  ],
  imports: [
    CommonModule,
    LoaderModule,
    NgxSmartModalModule.forRoot(),
    SvgModule,
    TranslateModule
  ],
  exports: [
    ExportDownloadModalComponent,
  ],
  providers: [],
})
export class ExportDownloadModalModule {}
