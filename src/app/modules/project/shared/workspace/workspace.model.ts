import { Drawing, DrawingBuilder } from './drawing.model';
import { Facsimile, FacsimileEffects } from './facsimile.model';
import { AreaSeed } from './../../../../core/data/data.model';
import { AnnotationStorage, SourceStorage, SentenceStorage, FacsimileStorage, FacsimileEffectsStorage, DrawingStorage } from './../../../../core/storage/storage.model';
import { Area, AreaBuilder } from './area.model';
import { GlyphBuilder } from './glyph.model';
import { Annotation, AnnotationBuilder } from './annotation.model';
import { Source } from './source.model';
import { AutoIdentifyRectBuilder } from './auto-identify-rect.model';
import { Sentence } from './sentence.model';
import { Word } from './word.model';

export const customKeys = [
  'author',
  'cartoucheData',
  'code',
  'comments',
  'created',
  'direction',
  'effects',
  'evented',
  'expanded',
  'gardinerCode',
  'gardinerCodePredictions',
  'glyphs',
  'hasBorders',
  'hasControls',
  'hasRotatingPoint',
  'hoverCursor',
  'id',
  'interpretation',
  'isCartouche',
  'label',
  'layers',
  'locked',
  'lockMovementX',
  'lockMovementY',
  'lockRotation',
  'lockScalingX',
  'lockScalingY',
  'order',
  'originX',
  'originY',
  'parentId',
  'perPixelTargetFind',
  'predictions',
  'selectable',
  'selected',
  'source',
  'src',
  'tid',
  'title',
  'translation',
  'transliteration',
  'type',
  'words',
];

export interface History {
  fabric: string;
  misc: {
    effects: FacsimileEffects;
  };
}

export interface WorkspaceHistory {
  current: History;
  undo: {
    stack: Array<History>;
  };
  redo: {
    stack: Array<History>;
  };
}

export interface WorkspaceConfig {
  ai: {
    identify: {
      enabled: boolean;
    };
    classification: {
      enabled: boolean;
    };
  };
  type: 'process' | 'generate' | 'analyse' | 'annotate';
  states: {
    loaded: boolean;
    panning: boolean;
  };
  tools: {
    selected: 'select' | 'pan' | 'zoomIn' | 'zoomZero' | 'zoomOut' | 'undo' | 'redo' | 'marquee' | 'polygon' | 'draw' | 'erase';
    visible: {
      select: boolean;
      pan: boolean;
      zoomIn: boolean;
      zoomZero: boolean;
      zoomOut: boolean;
      undo: boolean;
      redo: boolean;
      marquee: boolean;
      polygon: boolean;
      draw: boolean;
      erase: boolean;
      sources: boolean;
    };
    enabled: {
      select: boolean;
      pan: boolean;
      zoomIn: boolean;
      zoomZero: boolean;
      zoomOut: boolean;
      undo: boolean;
      redo: boolean;
      marquee: boolean;
      polygon: boolean;
      draw: boolean;
      erase: boolean;
      sources: boolean;
    };
  };
  panels: {
    active: {
      sources: boolean;
    };
  };
  selectedGlyphParent: Sentence | Word;
}

export interface WorkspaceData {
  sources: Array<Source>;
  facsimile: {
    processed: Facsimile;
    generated: Facsimile;
  };
  process: {
    areas: Array<Area>;
  };
  generate: {
    drawings: Array<Drawing>;
    effects: FacsimileEffects;
  };
  analyse: {
    sentences: Array<Sentence>;
  };
  annotate: {
    annotations: Array<Annotation>;
  };
}

export interface WorkspacePosition {
  x: number;
  y: number;
  zoom: number;
}

export interface WorkspaceObjectPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface WorkspacePoint {
  x: number;
  y: number;
}

export interface WorkspaceSeed {
  sources: Array<SourceStorage>;
  facsimile: {
    processed: FacsimileStorage;
    generated: FacsimileStorage;
  };
  drawings: Array<DrawingStorage>;
  effects: FacsimileEffectsStorage;
  annotations: Array<AnnotationStorage>;
  areas: Array<AreaSeed>;
  sentences: Array<SentenceStorage>;
  position: WorkspacePosition;
}

export interface BuilderData {
  type: 'annotation' | 'glyph' | 'area' | 'auto-identify-rect' | 'drawing';
  instance: AnnotationBuilder | GlyphBuilder | AreaBuilder | AutoIdentifyRectBuilder | DrawingBuilder;
  eventHandlers: Array<BuilderDataEventHandler>;
  selectedGlyphParent: Sentence | Word;
}

interface BuilderDataEventHandler {
  event: string;
  handler: any;
}
