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

import { extend } from 'lodash';

export class Threshold {

  private imageData: ImageData;
  private options = {
    active: true,
    level: 128,
    invert: false,
  };

  constructor (imageData: ImageData) {
    this.imageData = imageData;
  }

  static isEnabled (): boolean {
    return true;
  }

  isEnabled (): boolean {
    return true;
  }

  update (opt?) {
    this.options = extend(this.options, opt);
    if (this.isEnabled() && this.options.active) {
      const length = this.imageData.data.length;
      for (let i = 0; i < length; i += 4) {

        let fill = this.options.invert ? 0 : 255;
        if (
          this.imageData.data[i] < this.options.level &&
          this.imageData.data[i + 1] < this.options.level &&
          this.imageData.data[i + 2] < this.options.level
        ) {
          fill = this.options.invert ? 255 : 0;
        }

        this.imageData.data[i] = fill;
        this.imageData.data[i + 1] = fill;
        this.imageData.data[i + 2] = fill;

        // If white then change to transparent
        if (this.imageData.data[i] === 255) {
          this.imageData.data[i + 3] = 0;
        }
      }
    }
    return this.imageData;
  }
}
