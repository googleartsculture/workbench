export interface IdentificationRequest {
  image: string;
  direction: 'ltr' | 'rtl';
  threshold: number;
}

export interface IdentificationResponse {
  cartouches: Array<IdentificationCartouche>;
  clusters: Array<IdentificationCluster>;
  direction: 'ltr' | 'rtl';
  groups: Array<Array<IdentificationCluster['cluster_id']>>;
}

export interface IdentificationCartouche {
  frames: Array<IdentificationCluster['cluster_id']>;
  inner: Array<IdentificationCluster['cluster_id']>;
  wrapper: Array<IdentificationCluster['cluster_id']>;
}


export interface IdentificationCluster {
  bounds: {
    height: number;
    order: number;
    width: number;
    x: number;
    y: number;
  };
  cluster_id: string;
  hull: Array<{ x: number; y: number; }>;
}

export interface IdentificationGroup {
  glyph: string;
  score: number;
}

export interface IdentificationWord {
  isCartouche: boolean;
  clusters: Array<IdentificationCluster>;
}
