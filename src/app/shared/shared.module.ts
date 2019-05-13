import { GlyphImageModule } from './glyph-image/glyph-image.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { ImageComponent } from './image/image.component';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { GlyphImageComponent } from './glyph-image/glyph-image.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { SvgModule } from './svg/svg.module';
import { TooltipModule } from './tooltip/tooltip.module';
import { LoaderModule } from './loader/loader.module';
import { ImageUploadModule } from './image-upload/image-upload.module';

@NgModule({
  imports: [
    CommonModule,
    SvgModule,
    TooltipModule,
    TranslateModule,
    GlyphImageModule,
    ImageUploadModule,
    TranslateModule
  ],
  declarations: [
    ImageComponent,
    FileUploadComponent,
  ],
  exports: [
    CommonModule,
    ImageComponent,
    ImageUploadComponent,
    FileUploadComponent,
    GlyphImageComponent,
    SvgModule,
    TooltipModule,
    LoaderModule,
    GlyphImageModule,
    ImageUploadModule,
  ]
})
export class SharedModule {}
