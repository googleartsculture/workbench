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
import { remove } from 'lodash';
import * as uuid from 'uuid';
import { WorkspacePoint } from './workspace.model';

export const annotationStyles = {
  active: {
    fill: 'rgba(55, 53, 41, 0.5)',
    opacity: 1,
    stroke: 'rgb(255, 0, 0)',
  },
  highlight: {
    fill: 'rgba(55, 53, 41, 0.5)',
    opacity: 1,
    stroke: 'rgb(0, 255, 0)',
  },
  inactive: {
    fill: 'rgba(55, 53, 41, 0.4)',
    opacity: 1,
    stroke: 'rgba(200, 200, 200, 0.5)',
  },
};

export interface AnnotationComment {
  author: string;
  comment: string;
  created: number;
  id: string;
}

export class Annotation extends fabric.Polygon {

  id: string;
  tid: string;
  author: string;
  created: number;
  selected: boolean;
  comments: Array<AnnotationComment>;

  constructor (points: Array<WorkspacePoint>, options?: fabric.IObjectOptions) {
    super(points, options);

    this.evented = true;
    this.fill = annotationStyles.inactive.fill;
    this.hasBorders = false;
    this.hasControls = false;
    this.hasRotatingPoint = false;
    this.hoverCursor = 'pointer';
    this.lockMovementX = true;
    this.lockMovementY = true;
    this.lockRotation = true;
    this.lockScalingX = true;
    this.lockScalingY = true;
    this.opacity = annotationStyles.inactive.opacity;
    this.perPixelTargetFind = true;
    this.selectable = true;
    this.stroke = annotationStyles.inactive.stroke;
    this.strokeWidth = 1;

    // Custom
    this.author = '';
    this.comments = [];
    this.created = new Date().getTime();
    this.id = uuid(); // Create uuid (RFC 4122 version 4)
    this.selected = false;
    this.tid = 'annotation';
  }

  addComment (text: AnnotationComment['comment'], author: AnnotationComment['author']): void {
    const comment: AnnotationComment = {
      id: uuid(),
      author: author,
      created: new Date().getTime(),
      comment: text,
    };
    this.comments.unshift(comment);
    text = '';
  }

  deleteComment (id: AnnotationComment['id']): Promise<boolean> {
    return new Promise(resolve => {
      if (!confirm(`This will delete 1 comment. Are you sure you want to proceed?`)) {
        resolve(false);
      } else {
        remove(this.comments, { id: id });
        resolve(true);
      }
    });
  }
}

export class AnnotationBuilder {

  private canvas: fabric.Canvas;
  private pointArray = [];
  private lineArray = [];
  private activeLine = null;
  private activeShape = null;
  private author: Annotation['author'];

  constructor (canvas, author) {
    this.canvas = canvas;
    this.author = author;
  }

  onMouseDown (opt): Annotation {
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
      radius: 7,
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
      strokeWidth: 2,
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

  generate (opt?: fabric.IEvent): Annotation {

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

    // Create final annotation
    const annotation = new Annotation(points);
    annotation.author = this.author;
    this.canvas.add(annotation);
    return annotation;
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
