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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyseComponent } from './analyse.component';
import { WorkspaceModule } from './../../shared/workspace/workspace.module';
import { LoaderModule } from './../../../../shared/loader/loader.module';
import { SvgModule } from './../../../../shared/svg/svg.module';
import { GlyphPickerModalModule } from '../../shared/glyph-picker-modal/glyph-picker-modal.module';
import { GlyphImageModule } from '../../../../shared/glyph-image/glyph-image.module';
import { TooltipModule } from './../../../../shared/tooltip/tooltip.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AnalyseComponent,
  ],
  imports: [
    CommonModule,
    SvgModule,
    LoaderModule,
    WorkspaceModule,
    GlyphPickerModalModule,
    GlyphImageModule,
    TooltipModule,
    TranslateModule,
    FormsModule,
  ],
  providers: [],
})
export class AnalyseModule {}
