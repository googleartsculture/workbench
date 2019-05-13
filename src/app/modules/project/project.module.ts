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
