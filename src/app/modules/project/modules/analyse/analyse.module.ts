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
