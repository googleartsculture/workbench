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
