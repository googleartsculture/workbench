import { Annotation } from '../../shared/workspace/annotation.model';

export interface AnnotateConfig {
  editing: {
    active: boolean,
    object: Annotation,
  };
}
