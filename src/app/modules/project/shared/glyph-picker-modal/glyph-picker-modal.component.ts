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

import { Component } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { filter, find } from 'lodash';
import { gardinerGlyphCategories, gardinerGlyphs, GardinerGlyph, GardinerGlyphCategory } from '../gardiner-glyphs.model';

@Component({
  selector: 'app-glyph-picker-modal',
  templateUrl: './glyph-picker-modal.component.html',
  styleUrls: ['./glyph-picker-modal.component.scss']
})
export class GlyphPickerModalComponent {
  private modalId = 'glyphPickerModal';

  categories: Array<GardinerGlyphCategory> = gardinerGlyphCategories;
  filteredGlyphs: Array<GardinerGlyph> = [];
  selectedGlyph: GardinerGlyph = null;
  selectedCat: GardinerGlyphCategory = null;
  loading = true;

  constructor (
    public ngxSmartModalService: NgxSmartModalService,
  ) { }

  onInit (): void {
    this.selectedCat = this.getCatByGlyph(gardinerGlyphs[0]);
  }

  onDataLoad (): void {
    this.loading = true;
    const modalData = this.ngxSmartModalService.getModalData(this.modalId);
    if (modalData && modalData.code) {
      this.selectedGlyph = find(gardinerGlyphs, { code: modalData.code });
      this.selectedCat = this.getCatByGlyph(this.selectedGlyph);
    }
    if (this.selectedCat) {
      this.filteredGlyphs = this.getGlyphsByCat(this.selectedCat);
    }
    this.loading = false;
  }

  onCatChange (): void {
    if (this.selectedCat) {
      this.loading = true;
      this.filteredGlyphs = this.getGlyphsByCat(this.selectedCat);
      this.loading = false;
    }
  }

  selectGlyph (glyph: GardinerGlyph): void {
    this.loading = true;
    this.ngxSmartModalService.setModalData({ code: null, result: glyph.code }, 'glyphPickerModal', true);
    this.ngxSmartModalService.close(this.modalId);
  }

  private getGlyphsByCat (cat: GardinerGlyphCategory): Array<GardinerGlyph> {

    const results = filter(gardinerGlyphs, (glyph: GardinerGlyph) => {
      const regex = RegExp(`^${ cat.prefix.toLowerCase() }[1-9]`, 'i');
      return regex.test(glyph.code.toLowerCase());
    });

    // Do a natural sort of results
    results.sort((a, b) => {
      const ax = [];
      const bx = [];
      a.code.replace(/(\d+)|(\D+)/g, (_, $1, $2) => {
        ax.push([$1 || Infinity, $2 || '']);
      });
      b.code.replace(/(\d+)|(\D+)/g, (_, $1, $2) => {
        bx.push([$1 || Infinity, $2 || '']);
      });
      while (ax.length && bx.length) {
        const an = ax.shift();
        const bn = bx.shift();
        const nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
        if (nn) {
          return nn;
        }
      }
      return ax.length - bx.length;
    });

    return results;
  }

  private getCatByGlyph (glyph: GardinerGlyph): GardinerGlyphCategory {
    return find(gardinerGlyphCategories, (cat) => {
      const regex = RegExp(`^${ cat.prefix.toLowerCase() }[1-9]`, 'i');
      return regex.test(glyph.code.toLowerCase());
    });
  }

}
