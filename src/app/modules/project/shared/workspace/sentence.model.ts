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
import { concat, filter, pull, includes, orderBy } from 'lodash';
import { SentenceStorage, WordStorage } from '../../../../core/storage/storage.model';
import { Word } from './word.model';
import { Glyph } from './glyph.model';

export class Sentence extends fabric.Group {
  author: string;
  canvas: fabric.Canvas;
  created: number;
  expanded: boolean;
  id: string;
  order: number;
  selected: boolean;
  tid: string;
  interpretation: string;
  transliteration: string;
  words: Array<Word['id']>;

  private wordsCache:  Array<Word>;
  private glyphsCache:  Array<Glyph>;

  constructor (sentenceStorage: SentenceStorage, canvas: fabric.Canvas) {
    super();

    this.canvas = canvas;

    sentenceStorage = sentenceStorage || {
      author: '',
      created: new Date().getTime(),
      words: [],
      order: 0,
      position: {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      },
      interpretation: '',
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

    // Custom
    this.author = sentenceStorage.author;
    this.created = sentenceStorage.created;
    this.expanded = true;
    this.id = uuid(); // Create uuid (RFC 4122 version 4)
    this.order = sentenceStorage.order;
    this.selected = false;
    this.tid = 'sentence';
    this.interpretation = sentenceStorage.interpretation;
    this.transliteration = sentenceStorage.transliteration;
    this.words = [];

    // Construct group items
    sentenceStorage.words.forEach((wordStorage: WordStorage) => {
      this.addWord(new Word(wordStorage, this.id, canvas));
    });
  }

  getWords (rebuildCache: boolean = false): Array<Word> {
    if (rebuildCache) {
      this.rebuildObjectsCache();
    }
    return this.wordsCache || [];
  }

  addWord (word: Word): void {
    if (word && this.canvas) {
      this.words.push(word.id);
      word.order = this.words.length;
      this.canvas.add(word);
      this.reorderWords();
    }
  }

  removeWord (word: Word): void {
    if (word && this.canvas) {
      word.getGlyphs().forEach(glyph => this.canvas.remove(glyph));
      this.words = pull(this.words, word.id);
      this.canvas.remove(word);
      this.reorderWords();
    }
  }

  wordCount (): number {
    return this.words.length;
  }

  glyphCount (): number {
    return this.getGlyphs().length;
  }

  getGlyphs (rebuildCache: boolean = false): Array<Glyph> {
    if (rebuildCache) {
      this.rebuildObjectsCache(true);
    }
    return this.glyphsCache || [];
  }

  reorderWords (): void {
    let cnt = 0;
    this.rebuildObjectsCache();
    this.getWords().forEach((w) => {
      if (w) {
        w.order = cnt;
        cnt++;
      }
    });
  }

  private rebuildObjectsCache (rebuildCache: boolean = false): void {
    let glyphs = [];
    let words = [];
    if (this.canvas) {
      words = orderBy(filter(this.canvas.getObjects(), o => {
        if (o.tid && o.tid === 'word' && includes(this.words, o.id)) {
          glyphs = concat(glyphs, (<Word>o).getGlyphs(rebuildCache));
          return true;
        }
        return false;
      }), 'order');
    }
    this.wordsCache = words;
    this.glyphsCache = glyphs;
  }
}
