import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-glyph-image',
  templateUrl: './glyph-image.component.html',
  styleUrls: ['./glyph-image.component.scss'],
})
export class GlyphImageComponent {

  @Input() set glyphCode(code: string) {
    if (code) {
      this.displayGlyph(code);
    }
  }

  imageSrc = '';

  constructor () { }

  private displayGlyph (code: string): void {
    this.imageSrc = `../../../assets/images/glyphs/${ code }.svg`;
  }
}
