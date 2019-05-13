import { SourceStorage, PositionStorage, ProjectStorage, FacsimileStorage } from './../storage/storage.model';
import { ThresholdEffect } from './../../modules/project/shared/workspace/area-effect.model';

export interface AreaSeed {
  author: string;
  created: number;
  effects: {
    threshold: ThresholdEffect,
  };
  position: PositionStorage;
  source: SourceStorage['id'];
}

export interface ProjectExport {
  project: ProjectStorage;
  files: {
    sources: Array<SourceStorage>;
    facsimiles: Array<FacsimileStorage>;
  };
}
