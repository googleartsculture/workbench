import { extend } from 'lodash';
const TRACE = null;

export class Trace {

  private imageData: ImageData;
  private options = {
    active: true,
    level: 128,
  };

  constructor (imageData: ImageData) {
    this.imageData = imageData;

    this.isEnabled();
  }

  static isEnabled (): boolean {
    return !!TRACE;
  }

  isEnabled (): boolean {
    return !!TRACE;
  }

  update (opt?): ImageData {
    this.options = extend(this.options, opt);
    if (this.isEnabled() && this.options.active) {

      // Trace needs the background of the canvas to be white
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

      // Trace needs to use a canvas, not just ImageData
      const canvas = document.createElement('canvas');
      canvas.width = this.imageData.width;
      canvas.height = this.imageData.height;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.putImageData(this.imageData, 0, 0);

      // Perform trace
      const trace = TRACE.traceCanvas(canvas, {
        turdsize: Math.floor(this.options.level / 2.55),
      });
      const svg = TRACE.getSVG(trace, 1.0);

      // Create new paths from `svg`
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000';
      const getMatches = (string: string, regex: RegExp, index: number = 1) => {
        const matches = [];
        let match;
        while (match = regex.exec(string)) {
          matches.push(match[index]);
        }
        return matches;
      };
      const paths = getMatches(svg, /.*?path[^\/]+d="(.*?)"/ig, 1);
      paths.forEach((pathData: string) => {
        ctx.fill(new Path2D(pathData));
      });

      // Get canvas image data
      this.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    return this.imageData;
  }

}
