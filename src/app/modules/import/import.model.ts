import { ProjectExport } from '../../core/data/data.model';

export interface ImportConfig {
  states: {
    loading: boolean;
    importing: boolean;
    saving: boolean;
    importValid: boolean;
  };
  import: {
    file: File;
    data: ProjectExport;
  };
}
