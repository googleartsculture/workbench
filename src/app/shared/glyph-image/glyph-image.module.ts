import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GlyphImageComponent } from './glyph-image.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule
  ],
  declarations: [
    GlyphImageComponent,
  ],
  exports: [
    GlyphImageComponent,
  ],
})
export class GlyphImageModule {}
