import { JSONSchemaArray, JSONSchemaObject, JSONSchemaString, JSONSchemaNumeric, JSONSchemaBoolean } from '@ngx-pwa/local-storage';

const positionStorageSchema: JSONSchemaObject = {
  properties: {
    height: { type: 'number' } as JSONSchemaNumeric,
    left: { type: 'number' } as JSONSchemaNumeric,
    top: { type: 'number' } as JSONSchemaNumeric,
    width: { type: 'number' } as JSONSchemaNumeric,
  },
};

export const sourceStorageSchema: JSONSchemaObject = {
  properties: {
    dataURL: { type: 'string' } as JSONSchemaString,
    id: { type: 'string' } as JSONSchemaString,
    title: { type: 'string' } as JSONSchemaString,
  },
};

export const facsimileStorageSchema: JSONSchemaObject = {
  properties: {
    dataURL: { type: 'string' } as JSONSchemaString,
    id: { type: 'string' } as JSONSchemaString,
  },
};

const facsimileEffectsStorageSchema: JSONSchemaObject = {
  properties: {
    drawing: {
      properties: {
        active: { type: 'boolean' } as JSONSchemaBoolean,
        width: { type: 'number' } as JSONSchemaNumeric,
      },
    } as JSONSchemaObject,
    outlines: {
      properties: {
        active: { type: 'boolean' } as JSONSchemaBoolean,
        level: { type: 'number' } as JSONSchemaNumeric,
      },
    } as JSONSchemaObject,
    trace: {
      properties: {
        active: { type: 'boolean' } as JSONSchemaBoolean,
        level: { type: 'number' } as JSONSchemaNumeric,
      },
    } as JSONSchemaObject,
  },
};

const pointStorageSchema: JSONSchemaObject = {
  properties: {
    x: { type: 'number' } as JSONSchemaNumeric,
    y: { type: 'number' } as JSONSchemaNumeric,
  }
};

const thresholdEffectStorageSchema: JSONSchemaObject = {
  properties: {
    active: { type: 'boolean' } as JSONSchemaBoolean,
    invert: { type: 'boolean' } as JSONSchemaBoolean,
    level: { type: 'string' } as JSONSchemaString,
    tid: { type: 'string' } as JSONSchemaString,
  },
};

const areaStorageSchema: JSONSchemaObject = {
  properties: {
    author: { type: 'string' } as JSONSchemaString,
    created: { type: 'number' } as JSONSchemaNumeric,
    effects: {
      items: thresholdEffectStorageSchema,
    } as JSONSchemaArray,
    position: positionStorageSchema,
    source: { type: 'string' } as JSONSchemaString,
  },
};

const drawingStorageSchema: JSONSchemaObject = {
  properties: {
    author: { type: 'string' } as JSONSchemaString,
    created: { type: 'number' } as JSONSchemaNumeric,
    dataURL: { type: 'string' } as JSONSchemaString,
    position: positionStorageSchema,
  },
};

const annotationCommentStorageSchema: JSONSchemaObject = {
  properties: {
    author: { type: 'string' } as JSONSchemaString,
    comment: { type: 'string' } as JSONSchemaString,
    created: { type: 'number' } as JSONSchemaNumeric,
    id: { type: 'string' } as JSONSchemaString,
  },
};

const annotationStorageSchema: JSONSchemaObject = {
  properties: {
    author: { type: 'string' } as JSONSchemaString,
    comments: { items: annotationCommentStorageSchema } as JSONSchemaArray,
    created: { type: 'number' } as JSONSchemaNumeric,
    points: { items: pointStorageSchema } as JSONSchemaArray,
  },
};

const classificationResultStorageSchema: JSONSchemaObject = {
  properties: {
    glyph: { type: 'string' } as JSONSchemaString,
    score: { type: 'number' } as JSONSchemaNumeric,
  },
};

const glyphStorageSchema: JSONSchemaObject = {
  properties: {
    author: { type: 'string' } as JSONSchemaString,
    created: { type: 'number' } as JSONSchemaNumeric,
    gardinerCode: { type: 'string' } as JSONSchemaString,
    gardinerCodePredictions: { items: classificationResultStorageSchema } as JSONSchemaArray,
    locked: { type: 'boolean' } as JSONSchemaBoolean,
    order: { type: 'number' } as JSONSchemaNumeric,
    points: { items: pointStorageSchema } as JSONSchemaArray,
  },
};

const wordStorageSchema: JSONSchemaObject = {
  properties: {
    author: { type: 'string' } as JSONSchemaString,
    created: { type: 'number' } as JSONSchemaNumeric,
    glyphs: { items: glyphStorageSchema } as JSONSchemaArray,
    isCartouche: { type: 'boolean' } as JSONSchemaBoolean,
    order: { type: 'number' } as JSONSchemaNumeric,
    position: positionStorageSchema,
    translation: { type: 'string' } as JSONSchemaString,
    transliteration: { type: 'string' } as JSONSchemaString,
  },
};

const sentenceStorageSchema: JSONSchemaObject = {
  properties: {
    author: { type: 'string' } as JSONSchemaString,
    created: { type: 'number' } as JSONSchemaNumeric,
    interpretation: { type: 'string' } as JSONSchemaString,
    order: { type: 'number' } as JSONSchemaNumeric,
    position: positionStorageSchema,
    transliteration: { type: 'string' } as JSONSchemaString,
    words: { items: wordStorageSchema } as JSONSchemaArray,
  },
};

export const projectStorageSchema: JSONSchemaObject = {
  properties: {
    annotations: { items: annotationStorageSchema } as JSONSchemaArray,
    appVersion: { type: 'string' } as JSONSchemaString,
    areas: { items: areaStorageSchema } as JSONSchemaArray,
    created: { type: 'number' } as JSONSchemaNumeric,
    drawings: { items: drawingStorageSchema } as JSONSchemaArray,
    effects: facsimileEffectsStorageSchema,
    facsimile: {
      properties: {
        generated: { type: 'string' } as JSONSchemaString,
        processed: { type: 'string' } as JSONSchemaString,
      },
    } as JSONSchemaObject,
    id: { type: 'string' } as JSONSchemaString,
    properties: {
      properties: {
        author: { type: 'string' } as JSONSchemaString,
        title: { type: 'string' } as JSONSchemaString,
      },
    } as JSONSchemaObject,
    sentences: { items: sentenceStorageSchema } as JSONSchemaArray,
    sources: { items: { type: 'string' } as JSONSchemaString } as JSONSchemaArray,
    updated: { type: 'number' } as JSONSchemaNumeric,
  },
};

export const projectListStorageSchema: JSONSchemaArray = {
  items: { type: 'string' } as JSONSchemaString,
};

export const settingsStorageSchema: JSONSchemaObject = {
  properties: {
    classification: {
      properties: {
        model: {
          properties: {
            displayName: { type: 'string' } as JSONSchemaString,
            name: { type: 'string' } as JSONSchemaString,
            version: { type: 'string' } as JSONSchemaString,
          },
        } as JSONSchemaObject,
      },
    } as JSONSchemaObject,
    clusterAnalysis: {
      properties: {
        threshold: { type: 'number' } as JSONSchemaNumeric,
      },
    } as JSONSchemaObject,
    userFullName: { type: 'string' } as JSONSchemaString,
  },
};
