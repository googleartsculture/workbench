import { Glyph } from './../../shared/workspace/glyph.model';
import { Translation } from '../../../../core/api/translation.model';

export interface AnalyseConfig {
  selected: Array<Glyph>;
  ai: AnalyseAIConfig;
  editing: {
    active: boolean;
    object: Glyph;
  };
  sortable: {
    instances: Array<any>;
  };
}

export interface AnalyseAIConfig {
  identify: {
    enabled: boolean;
    loading: boolean;
  };
  classification: {
    enabled: boolean;
    loading: boolean;
    glyphs: Array<Glyph['id']>
  };
  translation: {
    enabled: boolean;
    active: boolean;
    sentences: Array<AnalyseTranslationResults>,
  };
}

export interface AnalyseTranslationResults {
  id: string;
  loading: boolean;
  results: Array<AnalyseTranslationResult>;
}

export interface AnalyseTranslationResult {
  end: number;
  sequence: Array<Glyph['gardinerCode']>;
  start: number;
  translation: Translation;
  transliteration: string;
}
