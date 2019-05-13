export interface GenerateConfig {
  effects: {
    loading: boolean;
    enabled: {
      drawing: boolean;
      trace: boolean;
      outlines: boolean;
    };
  };
}
