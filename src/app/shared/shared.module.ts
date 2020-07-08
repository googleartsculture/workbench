// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
