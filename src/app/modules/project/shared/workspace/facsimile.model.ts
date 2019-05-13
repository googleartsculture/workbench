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
