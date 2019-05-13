import { FacsimileDownloadModalModule } from './../../shared/facsimile-download-modal/facsimile-download-modal.module';
import { GlyphPickerModalModule } from './../../shared/glyph-picker-modal/glyph-picker-modal.module';
import { ImageUploadModule } from './../../../../shared/image-upload/image-upload.module';
import { LoaderModule } from './../../../../shared/loader/loader.module';
import { FormsModule } from '@angular/forms';
import { PropertiesComponent } from './properties.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgModule } from './../../../../shared/svg/svg.module';
import { TranslateModule } from '@ngx-translate/core';
import { ExportDownloadModalModule } from './../../shared/export-download-modal/export-download-modal.module';

@NgModule({
  declarations: [
    PropertiesComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    LoaderModule,
    ImageUploadModule,
    SvgModule,
    GlyphPickerModalModule,
    FacsimileDownloadModalModule,
    ExportDownloadModalModule,
    TranslateModule
  ],
  providers: [],
})
export class PropertiesModule {}
