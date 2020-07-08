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

import { fabric } from 'fabric';
import * as uuid from 'uuid';
import { WordStorage, GlyphStorage } from '../../../../core/storage/storage.model';
import { Glyph } from './glyph.model';
import { find, pull, filter, includes, orderBy } from 'lodash';
import { Sentence } from './sentence.model';

export class Word extends fabric.Group {
  author: string;
  canvas: fabric.Canvas;
  created: number;
  glyphs: Array<Glyph['id']>;
  id: string;
  isCartouche: boolean;
  order: number;
  parentId: Sentence['id'];
  selected: boolean;
  tid: string;
  translation: string;
  transliteration: string;
  expanded: boolean;

  private glyphsCache:  Array<Glyph>;

  constructor (wordStorage: WordStorage, parentId: Sentence['id'], canvas: fabric.Canvas) {
    super();

    this.canvas = canvas;

    wordStorage = wordStorage || {
      author: '',
      created: new Date().getTime(),
      glyphs: [],
      order: 0,
      isCartouche: false,
      position: {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      },
      translation: '',
      transliteration: '',
    };

    this.evented = false;
    this.hasBorders = false;
    this.hasControls = false;
    this.hoverCursor = 'pointer';
    this.lockMovementX = true;
    this.lockMovementY = true;
    this.lockRotation = true;
    this.lockScalingX = true;
    this.lockScalingY = true;
    this.selectable = false;
    this.selected = false;
    this.expanded = false;

    // Custom
    this.author = wordStorage.author;
    this.created = wordStorage.created;
    this.id = uuid(); // Create uuid (RFC 4122 version 4)
    this.isCartouche = wordStorage.isCartouche;
    this.order = wordStorage.order;
    this.parentId = parentId;
    this.tid = 'word';
    this.translation = wordStorage.translation;
    this.transliteration = wordStorage.transliteration;

    // Construct group items
    this.glyphs = [];
    wordStorage.glyphs.forEach((glyphStorage: GlyphStorage) => {
      const glyph = new Glyph(glyphStorage.points, this.id, this.canvas);
      glyph.set({
        author: glyphStorage.author,
        created: glyphStorage.created,
        gardinerCode: glyphStorage.gardinerCode,
        gardinerCodePredictions: glyphStorage.gardinerCodePredictions,
        locked: glyphStorage.locked,
        order: glyphStorage.order,
      });
      this.addGlyph(glyph);
    });
  }

  getParent (): Sentence {
    if (this.canvas) {
      return find(this.canvas.getObjects(), { id: this.parentId });
    }
    return null;
  }

  getGlyphs (rebuildCache: boolean = false): Array<Glyph> {
    if (rebuildCache) {
      this.rebuildObjectsCache();
    }
    return this.glyphsCache || [];
  }

  addGlyph (glyph: Glyph): void {
    if (glyph && this.canvas) {
      this.glyphs.push(glyph.id);
      glyph.order = this.glyphs.length;
      this.canvas.add(glyph);
      this.reorderGlyphs();
    }
  }

  removeGlyph (glyph: Glyph): void {
    if (glyph && this.canvas) {
      this.glyphs = pull(this.glyphs, glyph.id);
      this.canvas.remove(glyph);
      this.reorderGlyphs();
    }
  }

  glyphCount (): number {
    return this.glyphs.length;
  }

  reorderGlyphs (): void {
    let cnt = 0;
    this.rebuildObjectsCache();
    this.getGlyphs().forEach((w) => {
      if (w) {
        w.order = cnt;
        cnt++;
      }
    });
  }

  rebuildObjectsCache (): void {
    let glyphs = [];
    if (this.canvas) {
      glyphs = orderBy(filter(this.canvas.getObjects(), o => {
        if (o.tid && o.tid === 'glyph' && includes(this.glyphs, o.id)) {
          return true;
        }
        return false;
      }), 'order');
    }
    this.glyphsCache = glyphs;
  }
}
