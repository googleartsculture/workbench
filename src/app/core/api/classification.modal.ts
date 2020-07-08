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

export interface ClassificationRequest {
  image: string;
  limit: number;
  model_name: string;
  model_version: string;
  original_height: number;
  original_width: number;
  threshold: number;
  weighted: boolean;
}

export interface ClassificationResult {
  glyph: string;
  score: number;
}
