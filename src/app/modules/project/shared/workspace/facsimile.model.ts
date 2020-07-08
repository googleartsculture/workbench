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

import { fabric } from 'fabric';
import * as uuid from 'uuid';

export interface FacsimileEffects {
  trace: {
    active: boolean;
    level: number;
  };
  outlines: {
    active: boolean;
    level: number;
  };
  drawing: {
    active: boolean;
    width: number;
  };
}

export class Facsimile extends fabric.Image {

  id: string;
  tid: string;

  constructor(element: HTMLImageElement, objObjects: fabric.IObjectOptions) {
    super(element, objObjects);

    this.backgroundColor = 'rgb(255, 255, 255)';
    this.evented = false; // Set dead in the canvas
    this.lockMovementX = true; // Cannot be moved
    this.lockMovementY = true; // Cannot be moved
    this.lockRotation = true; // Cannot be moved
    this.lockScalingX = true; // Cannot be moved
    this.lockScalingY = true; // Cannot be moved
    this.opacity = 1;
    this.selectable = false;  // Set dead in the canvas

    // Custom
    this.id = uuid(); // Create uuid (RFC 4122 version 4)
    this.tid = 'facsimile';
  }
}
