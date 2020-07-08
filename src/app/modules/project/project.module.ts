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

import { AnalyseModule } from './modules/analyse/analyse.module';
import { AnnotateModule } from './modules/annotate/annotate.module';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GenerateModule } from './modules/generate/generate.module';
import { NgModule } from '@angular/core';
import { ProcessModule } from './modules/process/process.module';
import { ProjectComponent } from './project.component';
import { ProjectRoutingModule } from './project-routing.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { SvgModule } from './../../shared/svg/svg.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ProjectComponent,
  ],
  imports: [
    AnalyseModule,
    AnnotateModule,
    BrowserModule,
    CommonModule,
    FormsModule,
    GenerateModule,
    ProcessModule,
    ProjectRoutingModule,
    PropertiesModule,
    SvgModule,
    TranslateModule,
  ],
  providers: [
  ],
})
export class ProjectModule {}
