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

export const drawingStyles = {
  draw: {
    color: 'rgb(0, 0, 0)',
  },
  erase: {
    color: 'rgb(255, 255, 255)',
  },
};

export interface DrawData {
  type: 'draw' | 'erase';
}

export class Drawing extends fabric.Image {
  id: string;
  tid: string;
  author: string;
  created: number;

  constructor (objObjects: fabric.IObjectOptions, element: HTMLImageElement = new Image()) {
    super(element, objObjects);

    this.backgroundColor = 'rgba(255, 255, 255, 0)';
    this.evented = false;
    this.hasBorders = false;
    this.hasControls = false;
    this.hasRotatingPoint = false;
    this.hoverCursor = 'default';
    this.lockMovementX = true;
    this.lockMovementY = true;
    this.lockRotation = true;
    this.lockScalingX = true;
    this.lockScalingY = true;
    this.opacity = 1;
    this.perPixelTargetFind = true;
    this.selectable = false;
    this.stroke = 'rgba(255, 255, 255, 0)';
    this.strokeWidth = 1;

    // Custom
    this.author = '';
    this.created = new Date().getTime();
    this.id = uuid(); // Create uuid (RFC 4122 version 4)
    this.tid = 'drawing';
  }

  getCompositeImageData (imageData: ImageData, opt?): ImageData {

    // Set drawing img to canvas
    const drawingEl = this.getElement();
    const drawingCanvas = document.createElement('canvas');
    const drawingCtx = drawingCanvas.getContext('2d');
    drawingCtx.imageSmoothingEnabled = false;
    drawingCanvas.width = drawingEl.width;
    drawingCanvas.height = drawingEl.height;
    drawingCtx.drawImage(drawingEl, 0, 0);

    // Setup output canvas
    const outputCanvas = document.createElement('canvas');
    const outputCtx = outputCanvas.getContext('2d');
    outputCtx.imageSmoothingEnabled = false;
    // outputCtx.translate(0.5, 0.5);  // Offset lines by .5 to avoid antialiasing
    outputCanvas.width = imageData.width;
    outputCanvas.height = imageData.height;

    // Draw original ImageData to output canvas
    outputCtx.putImageData(imageData, 0, 0);

    // Draw drawing ImageData to output canvas
    outputCtx.drawImage(drawingCanvas, this.left, this.top);

    imageData = outputCtx.getImageData(0, 0, imageData.width, imageData.height);

    return imageData;
  }
}

export class DrawingBuilder {
  private canvas: fabric.Canvas;
  private author: Drawing['author'];
  private drawing: Drawing;

  constructor (canvas, author, drawData: DrawData) {
    this.canvas = canvas;
    this.author = author;

    (<any>this.canvas).freeDrawingBrush.color = drawingStyles[drawData.type].color;
  }

  onMouseDown (opt: any): Drawing {
    return null;
  }

  onMouseMove (opt: fabric.IEvent): void {}

  generate (opt: fabric.IEvent): Drawing {
    return null;
  }

  build (path: fabric.Path): Promise<Drawing> {
    return new Promise(resolve => {

      // Convert path to image
      const img = new Image();
      img.onload = () => {
        this.drawing = new Drawing({}, img);
        this.drawing.set({
          author: this.author,
          top: Math.round(path.top),
          left: Math.round(path.left),
          width: img.width,
          height: img.height,
        });
        this.canvas.add(this.drawing);
        this.drawing.bringToFront();
        this.drawing.setCoords();

        resolve(this.drawing);
      };
      img.src = path.toDataURL({});
    });

  }

  clear (): void {}
}
