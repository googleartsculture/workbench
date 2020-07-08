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

export class Source extends fabric.Image {

  id: string;
  title: string;
  tid: string;

  constructor(element: HTMLImageElement, objObjects: fabric.IObjectOptions) {
    super(element, objObjects);

    this.evented = false; // Set dead in the canvas
    this.lockMovementX = true; // Cannot be moved
    this.lockMovementY = true; // Cannot be moved
    this.lockRotation = true; // Cannot be moved
    this.lockScalingX = true; // Cannot be moved
    this.lockScalingY = true; // Cannot be moved
    this.hasBorders = false;
    this.hasControls = false;
    this.hasRotatingPoint = false;
    this.opacity = 1;
    this.selectable = false;  // Set dead in the canvas

    // Custom
    this.id = uuid(); // Create uuid (RFC 4122 version 4)
    this.tid = 'source';
    this.title = 'Untitled';
  }
}
