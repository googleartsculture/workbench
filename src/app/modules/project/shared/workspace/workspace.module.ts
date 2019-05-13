import { FormsModule } from '@angular/forms';
import { SvgModule } from './../../../../shared/svg/svg.module';
import { LoaderModule } from './../../../../shared/loader/loader.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspaceComponent } from './workspace.component';
import { TooltipModule } from './../../../../shared/tooltip/tooltip.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    WorkspaceComponent,
  ],
  imports: [
    CommonModule,
    LoaderModule,
    SvgModule,
    FormsModule,
    TooltipModule,
    TranslateModule
  ],
  exports: [
    WorkspaceComponent,
  ],
  providers: [],
})
export class WorkspaceModule {}
