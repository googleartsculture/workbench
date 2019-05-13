import { Glyph } from '../../modules/project/shared/workspace/glyph.model';

export interface TranslationRequest {
  sequence: Array<Glyph['gardinerCode']>;
}

export interface TranslationResult {
  end: number;
  sequence: Array<Glyph['gardinerCode']>;
  start: number;
  translations: Array<Translation>;
  transliteration: string;
}

export interface Translation {
  locale: string;
  translation: string;
}
