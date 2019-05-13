import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessComponent } from './process.component';
import { WorkspaceModule } from './../../shared/workspace/workspace.module';
import { LoaderModule } from './../../../../shared/loader/loader.module';
import { SvgModule } from './../../../../shared/svg/svg.module';
import { TooltipModule } from './../../../../shared/tooltip/tooltip.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ProcessComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SvgModule,
    LoaderModule,
    WorkspaceModule,
    TooltipModule,
    TranslateModule
  ],
  providers: [],
})
export class ProcessModule {}
