import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnnotateComponent } from './annotate.component';
import { WorkspaceModule } from './../../shared/workspace/workspace.module';
import { LoaderModule } from './../../../../shared/loader/loader.module';
import { SvgModule } from './../../../../shared/svg/svg.module';
import { TooltipModule } from './../../../../shared/tooltip/tooltip.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AnnotateComponent,
  ],
  imports: [
    CommonModule,
    SvgModule,
    LoaderModule,
    WorkspaceModule,
    TooltipModule,
    TranslateModule
  ],
  providers: [],
})
export class AnnotateModule {}
