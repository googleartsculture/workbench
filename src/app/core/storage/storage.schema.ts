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

import { JSONSchema } from '@ngx-pwa/local-storage';

const positionStorageSchema: JSONSchema = {
  type: 'object',
  properties: {
    height: { type: 'number' },
    left: { type: 'number' },
    top: { type: 'number' },
    width: { type: 'number' },
  },
};

export const sourceStorageSchema: JSONSchema = {
  type: 'object',
  properties: {
    dataURL: { type: 'string' },
    id: { type: 'string' },
    title: { type: 'string' },
  },
};

export const facsimileStorageSchema: JSONSchema = {
  type: 'object',
  properties: {
    dataURL: { type: 'string' },
    id: { type: 'string' },
  },
};

const facsimileEffectsStorageSchema: JSONSchema = {
  type: 'object',
  properties: {
    drawing: {
      type: 'object',
      properties: {
        active: { type: 'boolean' },
        width: { type: 'number' },
      },
    },
    outlines: {
      type: 'object',
      properties: {
        active: { type: 'boolean' },
        level: { type: 'number' },
      },
    },
    trace: {
      type: 'object',
      properties: {
        active: { type: 'boolean' },
        level: { type: 'number' },
      },
    },
  },
};

const pointStorageSchema: JSONSchema = {
  type: 'object',
  properties: {
    x: { type: 'number' },
    y: { type: 'number' },
  }
};

const thresholdEffectStorageSchema: JSONSchema = {
  type: 'object',
  properties: {
    active: { type: 'boolean' },
    invert: { type: 'boolean' },
    level: { type: 'string' },
    tid: { type: 'string' },
  },
};

const areaStorageSchema: JSONSchema = {
  type: 'object',
  properties: {
    author: { type: 'string' },
    created: { type: 'number' },
    effects: {
      type: 'array',
      items: thresholdEffectStorageSchema,
    },
    position: positionStorageSchema,
    source: { type: 'string' },
  },
};

const drawingStorageSchema: JSONSchema = {
  type: 'object',
  properties: {
    author: { type: 'string' },
    created: { type: 'number' },
    dataURL: { type: 'string' },
    position: positionStorageSchema,
  },
};

const annotationCommentStorageSchema: JSONSchema = {
  type: 'object',
  properties: {
    author: { type: 'string' },
    comment: { type: 'string' },
    created: { type: 'number' },
    id: { type: 'string' },
  },
};

const annotationStorageSchema: JSONSchema = {
  type: 'object',
  properties: {
    author: { type: 'string' },
    comments: {
      type: 'array',
      items: annotationCommentStorageSchema
    },
    created: { type: 'number' },
    points: {
      items: pointStorageSchema,
      type: 'array',
    },
  },
};

const classificationResultStorageSchema: JSONSchema = {
  type: 'object',
  properties: {
    glyph: { type: 'string' },
    score: { type: 'number' },
  },
};

const glyphStorageSchema: JSONSchema = {
  type: 'object',
  properties: {
    author: { type: 'string' },
    created: { type: 'number' },
    gardinerCode: { type: 'string' },
    gardinerCodePredictions: {
      items: classificationResultStorageSchema,
      type: 'array'
    },
    locked: { type: 'boolean' },
    order: { type: 'number' },
    points: {
      items: pointStorageSchema,
      type: 'array'
    },
  },
};

const wordStorageSchema: JSONSchema = {
  type: 'object',
  properties: {
    author: { type: 'string' },
    created: { type: 'number' },
    glyphs: {
      items: glyphStorageSchema,
      type: 'array'
    },
    isCartouche: { type: 'boolean' },
    order: { type: 'number' },
    position: positionStorageSchema,
    translation: { type: 'string' },
    transliteration: { type: 'string' },
  },
};

const sentenceStorageSchema: JSONSchema = {
  type: 'object',
  properties: {
    author: { type: 'string' },
    created: { type: 'number' },
    interpretation: { type: 'string' },
    order: { type: 'number' },
    position: positionStorageSchema,
    transliteration: { type: 'string' },
    words: {
      items: wordStorageSchema,
      type: 'array',
    },
  },
};

export const projectStorageSchema: JSONSchema = {
  type: 'object',
  properties: {
    annotations: {
      items: annotationStorageSchema,
      type: 'array',
    },
    appVersion: { type: 'string' },
    areas: {
      items: areaStorageSchema,
      type: 'array',
    },
    created: { type: 'number' },
    drawings: {
      items: drawingStorageSchema,
      type: 'array',
    },
    effects: facsimileEffectsStorageSchema,
    facsimile: {
      type: 'object',
      properties: {
        generated: { type: 'string' },
        processed: { type: 'string' },
      },
    },
    id: { type: 'string' },
    properties: {
      type: 'object',
      properties: {
        author: { type: 'string' },
        title: { type: 'string' },
      },
    },
    sentences: {
      items: sentenceStorageSchema,
      type: 'array'
    },
    sources: {
      items: { type: 'string' },
      type: 'array'
    },
    updated: { type: 'number' }
  },
};

export const projectListStorageSchema: JSONSchema = {
  items: { type: 'string' },
  type: 'array'
};

export const settingsStorageSchema: JSONSchema = {
  type: 'object',
  properties: {
    classification: {
      type: 'object',
      properties: {
        model: {
          type: 'object',
          properties: {
            displayName: { type: 'string' },
            name: { type: 'string' },
            version: { type: 'string' },
          },
        },
      },
    },
    clusterAnalysis: {
      type: 'object',
      properties: {
        threshold: { type: 'number' },
      },
    },
    userFullName: { type: 'string' },
  },
};
