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

export const environment = {
    appVersion: '',
    production: true,
    config: {
      apiServices: {
        enabled: true,
        // Replace this value.
        key: 'CHANGE_ME',
        translation: {
          // Set this to the correct backend.
          url: 'https://translation-api-dot-rosetta-ai-dev.appspot.com '
        },
        clusterAnalysis: {
          // Set this to the correct backend.
          url: 'https://cluster-analysis-api-dot-rosetta-ai-dev.appspot.com'
        },
        classification: {
          // Set this to the correct backend.
          url: 'https://classification-api2-dot-rosetta-ai-dev.appspot.com',
          models: [
            {
              displayName: 'Hieroglyphs',
              name: 'ICN376997904574787450',
              version: 'ICN376997904574787450'
            }
          ] // add
        }
      },
      fontServices: {
        webfontloaderConfig: {}
      },
      localisation: {
        default: 'en',
        langs: []
      }
    }
  };
