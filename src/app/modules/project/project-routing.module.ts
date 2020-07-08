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

import { AnalyseComponent } from './modules/analyse/analyse.component';
import { AnnotateComponent } from './modules/annotate/annotate.component';
import { GenerateComponent } from './modules/generate/generate.component';
import { NgModule } from '@angular/core';
import { ProcessComponent } from './modules/process/process.component';
import { ProjectComponent } from '../project/project.component';
import { PropertiesComponent } from './modules/properties/properties.component';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from '../page-not-found/page-not-found.component';

const projectRoutes: Routes = [
  {
    path: 'project/:id',
    component: ProjectComponent,
    children: [
      {
        path: 'process',
        component: ProcessComponent,
      },
      {
        path: 'generate',
        component: GenerateComponent,
      },
      {
        path: 'analyse',
        component: AnalyseComponent,
      },
      {
        path: 'annotate',
        component: AnnotateComponent,
      },
      {
        path: 'properties',
        component: PropertiesComponent,
      },
      {
        path: '',
        redirectTo: 'process',
        pathMatch: 'full',
      },
      {
        path: '**',
        component: PageNotFoundComponent,
      },
    ]
  },
  {
    path: 'project',
    redirectTo: '/',
    pathMatch: 'full',
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(projectRoutes)],
  exports: [RouterModule]
})
export class ProjectRoutingModule {}
