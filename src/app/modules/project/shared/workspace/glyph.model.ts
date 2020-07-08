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

import { ClassificationResult } from '../../../../core/api/classification.modal';
import { fabric } from 'fabric';
import * as uuid from 'uuid';
import { WorkspacePoint, WorkspaceObjectPosition, } from './workspace.model';
import { Word } from './word.model';
import { find } from 'lodash';
import { Sentence } from './sentence.model';

export const glyphStyles = {
  active: {
    fill: 'rgba(16, 180, 106, 0.3)',
    opacity: 1,
    stroke: 'rgba(16, 180, 106, 0.6)',
  },
  inactive: {
    fill: 'rgba(180, 96, 16, 0.3)',
    opacity: 1,
    stroke: 'rgba(180, 96, 16, 0.3)',
  },
  highlight: {
    fill: 'rgba(250, 223, 132, 0.4)',
    opacity: 1,
    stroke: 'rgba(250, 223, 132, 0.6)',
  },
};

export class Glyph extends fabric.Polygon {
  author: string;
  canvas: fabric.Canvas;
  created: number;
  gardinerCode: string;
  gardinerCodePredictions: Array<ClassificationResult>;
  id: string;
  locked: boolean;
  order: number;
  parentId: Word['id'];
  selected: boolean;
  tid: string;

  constructor (points: Array<WorkspacePoint>, parentId: Word['id'], canvas: fabric.Canvas, options?: fabric.IObjectOptions) {
    super(points, options);
    this.canvas = canvas;

    this.angle = 0;
    this.evented = true;
    this.fill = glyphStyles.inactive.fill;
    this.hasBorders = false;
    this.hasControls = false;
    this.hasRotatingPoint = false;
    this.hoverCursor = 'pointer';
    this.lockMovementX = true;
    this.lockMovementY = true;
    this.lockRotation = true;
    this.lockScalingX = true;
    this.lockScalingY = true;
    this.opacity = glyphStyles.inactive.opacity;
    this.perPixelTargetFind = true;
    this.selectable = true;
    this.stroke = glyphStyles.inactive.stroke;
    this.strokeWidth = 1;

    // Custom
    this.author = '';
    this.created = new Date().getTime();
    this.gardinerCode = '';
    this.gardinerCodePredictions = [];
    this.id = uuid(); // Create uuid (RFC 4122 version 4)
    this.locked = false;
    this.order = 0;
    this.parentId = parentId;
    this.selected = false;
    this.tid = 'glyph';
  }

  getParent (): Word {
    if (this.canvas) {
      return find(this.canvas.getObjects(), {
        id: this.parentId,
      });
    }
    return null;
  }

  absolutePosition (): WorkspaceObjectPosition {
    const position: WorkspaceObjectPosition = {
      top: this.top,
      left: this.left,
      width: this.width,
      height: this.height,
    };

    const group = (<any>this).group;
    if (group) {
      position.top += (group.height / 2) + group.top;
      position.left += (group.width / 2) + group.left;
    }

    return position;
  }
}

export class GlyphBuilder {
  parent: Sentence | Word;

  private canvas: fabric.Canvas;
  private pointArray = [];
  private lineArray = [];
  private activeLine = null;
  private activeShape = null;
  private author: Glyph['author'];

  constructor (canvas: fabric.Canvas, author: Glyph['author'], parent?: Sentence | Word) {
    this.canvas = canvas;
    this.parent = parent;
    this.author = author;
  }

  onMouseDown (opt): Glyph {
    if (
      opt.target &&
      this.pointArray[0] &&
      opt.target.id === this.pointArray[0].id
    ) {
      return this.generate();
    } else {
      this.addPoint(opt);
      return null;
    }
  }

  onMouseMove (opt: fabric.IEvent): void {

    if (this.activeLine && this.activeLine.class === 'line') {
      const pointer = this.canvas.getPointer(opt.e);
      this.activeLine.set({
        x2: pointer.x,
        y2: pointer.y,
      });
      this.canvas.renderAll();
    }
  }

  private addPoint (opt: fabric.IEvent): void {

    const pointer = this.canvas.getPointer(opt.e);

    const circle = new fabric.Circle({
      radius: 5,
      fill: '#fbe085',
      stroke: '#373529',
      strokeWidth: 0.5,
      left: pointer.x,
      top: pointer.y,
      selectable: false,
      hasBorders: false,
      hasControls: false,
      originX: 'center',
      originY: 'center',
    });

    fabric.util.object.extend(circle, {
      id: new Date().getTime(),
    });

    if (this.pointArray.length === 0) {
      circle.set({
        fill: '#a94442',
      });
    }

    const points = [
      pointer.x,
      pointer.y,
      pointer.x,
      pointer.y
    ];

    const line = new fabric.Line(points, {
      strokeWidth: 1,
      fill: '#a7a599',
      stroke: '#a7a599',
      originX: 'center',
      originY: 'center',
      selectable: false,
      hasBorders: false,
      hasControls: false,
      evented: false,
    });

    fabric.util.object.extend(line, {
      class: 'line',
    });

    if (this.activeShape) {
      const activePoints = this.activeShape.get('points');
      activePoints.push({
        x: pointer.x,
        y: pointer.y
      });

      const polygon = new fabric.Polygon(activePoints, {
        stroke: '#373529',
        strokeWidth: 3,
        fill: '#fbe085',
        opacity: 0.1,
        selectable: false,
        hasBorders: false,
        hasControls: false,
        evented: false,
      });
      this.canvas.remove(this.activeShape);
      this.canvas.add(polygon);
      this.activeShape = polygon;
      this.canvas.renderAll();

    } else {

      const polyPoint = [
        {
          x: pointer.x,
          y: pointer.y,
        }
      ];
      const polygon = new fabric.Polygon(polyPoint, {
        stroke: '#373529',
        strokeWidth: 1,
        fill: '#fbe085',
        opacity: 0.1,
        selectable: false,
        hasBorders: false,
        hasControls: false,
        evented: false
      });
      this.activeShape = polygon;
      this.canvas.add(polygon);
    }
    this.activeLine = line;

    this.pointArray.push(circle);
    this.lineArray.push(line);

    this.canvas.add(line);
    this.canvas.add(circle);
  }

  generate (opt?: fabric.IEvent): Glyph {

    // Save and remove polygon points from canvas
    const points = [];
    const pointsLen = this.pointArray.length;
    for (let i = 0; i < pointsLen; i++) {
      const point = this.pointArray[i];
      points.push({
        x: point.left,
        y: point.top
      });
      this.canvas.remove(point);
    }

    // Remove polygon lines from canvas
    const lineArrayLen = this.lineArray.length;
    for (let i = 0; i < lineArrayLen; i++) {
      this.canvas.remove(this.lineArray[i]);
    }
    this.canvas.remove(this.activeShape).remove(this.activeLine);

    // Create final glyph
    const glyph = new Glyph(points, null, this.canvas);
    glyph.author = this.author;
    return glyph;
  }

  clear (): void {

    // Remove polygon points from canvas
    const pointsLen = this.pointArray.length;
    for (let i = 0; i < pointsLen; i++) {
      this.canvas.remove(this.pointArray[i]);
    }

    // Remove polygon lines from canvas
    const lineArrayLen = this.lineArray.length;
    for (let i = 0; i < lineArrayLen; i++) {
      this.canvas.remove(this.lineArray[i]);
    }

    // Clean up
    this.canvas.remove(this.activeShape).remove(this.activeLine);
  }

}
