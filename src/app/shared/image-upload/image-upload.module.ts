import { SvgModule } from './../svg/svg.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ImageUploadComponent } from './image-upload.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    SvgModule,
    TranslateModule,
  ],
  declarations: [
    ImageUploadComponent,
  ],
  exports: [
    ImageUploadComponent,
  ],
})
export class ImageUploadModule {}
