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

import { Source } from './source.model';
import { fabric } from 'fabric';
import * as uuid from 'uuid';
import { ThresholdEffect } from './area-effect.model';
import { Threshold } from './threshold.effect';

export const areaStyles = {
  active: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    opacity: 1,
    stroke: 'rgb(255, 0, 0)',
  },
  highlight: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    opacity: 1,
    stroke: 'rgb(0, 255, 0)',
  },
  inactive: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    opacity: 1,
    stroke: 'rgba(200, 200, 200, 0.5)',
  },
};

export class Area extends fabric.Image {
  id: string;
  tid: string;
  author: string;
  created: number;
  selected: boolean;
  source: Source['id'];
  effects: {
    threshold: ThresholdEffect,
  };

  constructor (objObjects: fabric.IObjectOptions, element: HTMLImageElement = new Image()) {
    super(element, objObjects);

    this.evented = true;
    this.backgroundColor = areaStyles.inactive.backgroundColor;
    this.hasBorders = true;
    this.hasControls = true;
    this.hasRotatingPoint = false;
    this.hoverCursor = 'move';
    this.lockMovementX = false;
    this.lockMovementY = false;
    this.lockRotation = true;
    this.lockScalingX = false;
    this.lockScalingY = false;
    this.opacity = areaStyles.inactive.opacity;
    this.selectable = true;
    this.stroke = areaStyles.inactive.stroke;
    this.strokeWidth = 1;

    // Custom
    this.author = '';
    this.created = new Date().getTime();
    this.id = uuid(); // Create uuid (RFC 4122 version 4)
    this.selected = false;
    this.source = '';
    this.tid = 'area';

    // Set initial values for effects
    this.effects = {
      threshold: {
        active: false,
        tid: 'threshold',
        invert: false,
        level: 128,
      },
    };
  }

  updateImage (source: Source): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!source || !this.width || !this.height) {
        resolve();
      }
      // Create effects canvas with source image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      canvas.width = this.width;
      canvas.height = this.height;
      ctx.drawImage(
        (<any>source).getElement(),
        this.left,
        this.top,
        this.width,
        this.height,
        0,
        0,
        this.width,
        this.height,
      );
      const sourceImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Apply effects
      const effectsImageData = this.runEffects(sourceImageData);

      // Update area image
      ctx.putImageData(effectsImageData, 0, 0);
      const img = new Image();
      img.onload = () => {
        this.setElement(img, null);
        this.setCoords();
        resolve();
      };
      img.onerror = () => {
        reject();
      };
      img.src = canvas.toDataURL();
    });
  }

  private runEffects (imageData: ImageData): ImageData {

    // Threshold
    if (this.effects.threshold.active) {
      const threshold = new Threshold(imageData);
      imageData = threshold.update({
        active: this.effects.threshold.active,
        level: this.effects.threshold.level,
        invert: this.effects.threshold.invert,
      });
    } else {
      // Reset to all white transparent
      const length = imageData.data.length;
      for (let i = 0; i < length; i += 4) {
        imageData.data[i] = 255;
        imageData.data[i + 1] = 255;
        imageData.data[i + 2] = 255;
        imageData.data[i + 3] = 0;
      }
    }

    return imageData;
  }
}

export class AreaBuilder {
  private canvas: fabric.Canvas;
  private author: Area['author'];
  private source: Area['source'];
  private originX: number;
  private originY: number;
  private area: Area;
  private building: boolean;

  constructor (canvas, author, source) {
    this.canvas = canvas;
    this.author = author;
    this.source = source;
    this.building = false;
  }

  onMouseDown (opt: any): Area {
    this.building = true;
    const pointer = this.canvas.getPointer(opt.e);
    this.originX = pointer.x;
    this.originY = pointer.y;

    this.area = new Area({
      top: this.originY,
      left: this.originX,
    });
    this.area.author = this.author;
    this.area.source = this.source;
    this.canvas.add(this.area);
    this.area.bringToFront();
    return null;
  }

  onMouseMove (opt: fabric.IEvent): void {
    if (this.building) {
      const pointer = this.canvas.getPointer(opt.e);
      if (this.originX > pointer.x) {
        this.area.set({ left: pointer.x });
      }
      if (this.originY > pointer.y) {
        this.area.set({ top: pointer.y });
      }
      const elem = this.area.getElement();
      const width = Math.abs(this.originX - pointer.x);
      const height = Math.abs(this.originY - pointer.y);
      // See https://github.com/fabricjs/fabric.js/issues/6031
      elem.width = width;
      elem.height = height;
      this.area.set({
        width: width,
        height: height,
      });
      this.canvas.requestRenderAll();
    }
  }

  generate (opt?: fabric.IEvent): Area {
    this.building = false;
    // Reset position
    this.area.width = Math.floor(this.area.width * this.area.scaleX);
    this.area.height = Math.floor(this.area.height * this.area.scaleY);
    this.area.top = Math.floor(this.area.top);
    this.area.left = Math.floor(this.area.left);
    this.area.scaleX = 1;
    this.area.scaleY = 1;
    this.area.setCoords();

    return this.area;
  }

  clear (): void {}

}
