export interface Settings {
  classification: {
    model: {
      displayName: string;
      name: string;
      version: string;
    }
  };
  clusterAnalysis: {
    threshold: number;
  };
  userFullName: string;
}

export interface DevData {
  browser: {
    name: string;
    version: string;
  };
  os: {
    name: string;
    version: string;
  };
  screen: {
    width: number;
    height: number;
  };
  window: {
    width: number;
    height: number;
  };
  ua: string;
}
