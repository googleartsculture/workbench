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
import { Sentence } from './sentence.model';
import { Word } from './word.model';

export const autoIdentifyRectStyles = {
  active: {
    fill: 'rgba(255, 255, 255, 0)',
    opacity: 1,
    stroke: 'rgba(255, 0, 0, 0.8)',
  },
  inactive: {
    fill: 'rgba(200, 200, 200, 0.3)',
    opacity: 1,
    stroke: 'rgba(200, 200, 200, 0.6)',
  },
};

export class AutoIdentifyRect extends fabric.Rect {

  tid: string;
  direction: 'ltr' | 'rtl';

  constructor (objObjects: fabric.IObjectOptions, element: HTMLImageElement = new Image()) {
    super(objObjects);

    this.evented = false;
    this.fill = autoIdentifyRectStyles.active.fill;
    this.hasBorders = false;
    this.hasControls = false;
    this.hasRotatingPoint = false;
    this.hoverCursor = 'move';
    this.lockMovementX = false;
    this.lockMovementY = false;
    this.lockRotation = true;
    this.lockScalingX = false;
    this.lockScalingY = false;
    this.opacity = autoIdentifyRectStyles.active.opacity;
    this.selectable = false;
    this.stroke = autoIdentifyRectStyles.active.stroke;
    this.strokeWidth = 1;

    // Custom
    this.direction = 'rtl';
    this.tid = 'auto-identify-rect';
  }
}

export class AutoIdentifyRectBuilder {
  parent: Sentence | Word;

  private canvas: fabric.Canvas;
  private originX: number;
  private originY: number;
  private rect: AutoIdentifyRect;
  private building: boolean;

  constructor (canvas: fabric.Canvas, parent?: Sentence | Word) {
    this.canvas = canvas;
    this.parent = parent;
    this.building = false;
  }

  onMouseDown (opt: any): AutoIdentifyRect {
    this.building = true;
    const pointer = this.canvas.getPointer(opt.e);
    this.originX = pointer.x;
    this.originY = pointer.y;

    this.rect = new AutoIdentifyRect({
      top: this.originY,
      left: this.originX,
    });
    this.canvas.add(this.rect);
    this.rect.bringToFront();
    return null;
  }

  onMouseMove (opt: fabric.IEvent): void {
    if (this.building) {
      const pointer = this.canvas.getPointer(opt.e);
      if (this.originX > pointer.x) {
        this.rect.set({ left: pointer.x });
      }
      if (this.originY > pointer.y) {
        this.rect.set({ top: pointer.y });
      }
      this.rect.set({
        width: Math.abs(this.originX - pointer.x),
        height: Math.abs(this.originY - pointer.y),
      });
      this.canvas.requestRenderAll();
    }
  }

  generate (opt?: fabric.IEvent): AutoIdentifyRect {
    this.building = false;
    // Get direction
    if (opt !== undefined) {
      const pointer = this.canvas.getPointer(opt.e);
      if (this.originX >= pointer.x) {
        this.rect.direction = 'rtl';
      } else {
        this.rect.direction = 'ltr';
      }
    }

    // Switch to loading (inactive) styles
    this.rect.set({
      fill: autoIdentifyRectStyles.inactive.fill,
      opacity: autoIdentifyRectStyles.inactive.opacity,
      stroke: autoIdentifyRectStyles.inactive.stroke,
    });

    // Reset position
    this.rect.width = Math.floor(this.rect.width * this.rect.scaleX);
    this.rect.height = Math.floor(this.rect.height * this.rect.scaleY);
    this.rect.top = Math.floor(this.rect.top);
    this.rect.left = Math.floor(this.rect.left);
    this.rect.scaleX = 1;
    this.rect.scaleY = 1;
    this.rect.setCoords();
    this.canvas.requestRenderAll();

    return this.rect;
  }

  clear (): void {}

}
