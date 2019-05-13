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



export const classificationPickerCategories = [
  {
    label: 'A: Man and his occupations',
    searchText: 'A',
  },
  {
    label: 'B: Woman and her occupations',
    searchText: 'B',
  },
  {
    label: 'C: Anthropomorphic deities',
    searchText: 'C',
  },
  {
    label: 'D: Parts of the human body',
    searchText: 'D',
  },
  {
    label: 'E: Mammals',
    searchText: 'E',
  },
  {
    label: 'F: Parts of mammals',
    searchText: 'F',
  },
  {
    label: 'G: Birds',
    searchText: 'G',
  },
  {
    label: 'H: Parts of birds',
    searchText: 'H',
  },
  {
    label: 'I: Amphibious animals, reptiles, etc.',
    searchText: 'I',
  },
  {
    label: 'K: Fish and parts of fish',
    searchText: 'K',
  },
  {
    label: 'L: Invertebrates and lesser animals',
    searchText: 'L',
  },
  {
    label: 'M: Trees and plants',
    searchText: 'M',
  },
  {
    label: 'N: Sky, earth, water',
    searchText: 'N',
  },
  {
    label: 'O: Buildings, parts of buildings, etc.',
    searchText: 'O',
  },
  {
    label: 'P: Ships and parts of ships',
    searchText: 'P',
  },
  {
    label: 'Q: Domestics and funerary furniture',
    searchText: 'Q',
  },
  {
    label: 'R: Temple furniture and sacred emblems',
    searchText: 'R',
  },
  {
    label: 'S: Crowns, dress, staves, etc.',
    searchText: 'S',
  },
  {
    label: 'T: Warfare, hunting, and butchery',
    searchText: 'T',
  },
  {
    label: 'U: Agriculture, crafts, and professions',
    searchText: 'U',
  },
  {
    label: 'V: Rope, fiber, baskets, bags, etc.',
    searchText: 'V',
  },
  {
    label: 'W: Vessels of stone and earthenware',
    searchText: 'W',
  },
  {
    label: 'X: Loaves and cakes',
    searchText: 'X',
  },
  {
    label: 'Y: Writings, games, music',
    searchText: 'Y',
  },
  {
    label: 'Z: Strokes, signs derived from Hieratic, geometrical figures',
    searchText: 'Z',
  },
  {
    label: 'AA: Unclassified',
    searchText: 'AA',
  },
];
