import { NgxSmartModalModule } from 'ngx-smart-modal';
import { LoaderModule } from './../../../../shared/loader/loader.module';
import { GlyphImageModule } from './../../../../shared/glyph-image/glyph-image.module';
import { FormsModule } from '@angular/forms';
import { SvgModule } from '../../../../shared/svg/svg.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlyphPickerModalComponent } from './glyph-picker-modal.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    GlyphPickerModalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SvgModule,
    LoaderModule,
    GlyphImageModule,
    TranslateModule,
    NgxSmartModalModule.forRoot(),
  ],
  exports: [
    GlyphPickerModalComponent,
  ],
  providers: [],
})
export class GlyphPickerModalModule {}
