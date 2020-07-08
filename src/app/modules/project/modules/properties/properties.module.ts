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
