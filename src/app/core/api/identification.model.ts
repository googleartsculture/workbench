// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
