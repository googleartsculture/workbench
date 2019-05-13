import { extend } from 'lodash';
import * as jsfeat from 'jsfeat';

export class Outlines {

  private imageData: ImageData;
  private options = {
    active: true,
    level: 16,
    thresholdLow: 128,
    thresholdHigh: 128,
  };

  constructor (imageData: ImageData) {
    this.imageData = imageData;
  }

  static isEnabled (): boolean {
    return jsfeat !== undefined;
  }

  isEnabled (): boolean {
    return jsfeat !== undefined;
  }

  update (opt?) {
    this.options = extend(this.options, opt);
    if (this.isEnabled() && this.options.active) {

      // Canny needs the background of the canvas to be white
      // If any pixels are not fully opaque, make them white
      const length = this.imageData.data.length;
      for (let i = 0; i < length; i += 4) {
        if (this.imageData.data[i + 3] !== 255) {
          this.imageData.data[i] = 255;
          this.imageData.data[i + 1] = 255;
          this.imageData.data[i + 2] = 255;
          this.imageData.data[i + 3] = 255;
        }
      }

      // JSFeat begin!
      const imgU8 = new jsfeat.matrix_t(this.imageData.width, this.imageData.height, jsfeat.U8C1_t);

      // Grayscale
      jsfeat.imgproc.grayscale(this.imageData.data, this.imageData.width, this.imageData.height, imgU8);

      if (this.options.level) {
        const blur = Math.floor(this.options.level / 25.5);
        jsfeat.imgproc.box_blur_gray(imgU8, imgU8, blur);
        jsfeat.imgproc.box_blur_gray(imgU8, imgU8, blur);
        jsfeat.imgproc.box_blur_gray(imgU8, imgU8, blur);
      }

      // Apply Canny
      jsfeat.imgproc.canny(imgU8, imgU8, this.options.thresholdLow, this.options.thresholdHigh);

      // Render result back to canvas
      const dataU32 = new Uint32Array(this.imageData.data.buffer);
      let j = imgU8.cols * imgU8.rows;
      let pix = 0;
      while (--j >= 0) {
        pix = imgU8.data[j];
        dataU32[j] = (0xff << 24) | (pix << 16) | (pix << 8) | pix;
      }

      // Canny produces white on black, we need black on transparent...
      for (let k = 0; k < length; k += 4) {
        // If white, change to black. Else change to transparent
        if (this.imageData.data[k] === 255) {
          this.imageData.data[k] = 0;
          this.imageData.data[k + 1] = 0;
          this.imageData.data[k + 2] = 0;
        } else {
          this.imageData.data[k + 3] = 0;
        }
      }
    }
    return this.imageData;
  }
}
