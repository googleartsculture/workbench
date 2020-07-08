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
