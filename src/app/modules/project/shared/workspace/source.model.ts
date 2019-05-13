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
