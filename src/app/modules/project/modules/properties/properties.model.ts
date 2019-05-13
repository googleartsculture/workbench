import { SourceStorage } from '../../../../core/storage/storage.model';

export interface PropertiesConfig {
  states: {
    loading: boolean;
    saving: boolean;
    saved: boolean;
    sourceChanged: boolean;
  };
}

export interface PropertiesSource {
  title: SourceStorage['title'];
  file: File;
  id: SourceStorage['id'];
}

export interface GlyphDistributionInfo {
  active: boolean;
  count: number;
  distributions: Array<GlyphDistribution>;
}

export interface GlyphDistribution {
  count: number;
  gardinerCode: string;
}
