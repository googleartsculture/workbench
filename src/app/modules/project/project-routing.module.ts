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
