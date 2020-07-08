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

import { Injectable } from '@angular/core';

@Injectable()
export class UtilsService {

  constructor () { }

  imageDataFromFile (file: File): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
        // Load file as dataURL
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        // Load dataURL into canvas
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
        };
        img.onerror = reject;
        img.src = fileReader.result as string;
      };
      fileReader.onerror = reject;
      fileReader.readAsDataURL(file);
    });
  }

  imageDataFromImg (img: HTMLImageElement): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
    });
  }

  fileFromImageData (imageData: ImageData, name?: string, mimeType?: string): Promise<File> {
    return new Promise((resolve, reject) => {
      // Get dataURL
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      ctx.putImageData(imageData, 0, 0);
      const dataURL = canvas.toDataURL();
      // Create file from dataURL
      const arr = dataURL.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      resolve(new File([u8arr], name || 'untitled', {
        type: mimeType || 'image/png',
      }));
    });
  }

  fileFromDataURL (dataURL: string, name?: string, mimeType?: string): Promise<File> {
    return new Promise((resolve, reject) => {
      const arr = dataURL.split(',');
      const mime = mimeType || arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      resolve(new File([u8arr], name || 'untitled', {
        type: mime || 'image/png',
      }));
    });
  }

  imgFromDataURL (dataURL: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      if (dataURL) {
        const img = new Image();
        img.onload = (e) => {
          resolve(img);
        };
        img.onerror = reject;
        img.src = dataURL;
      } else {
        reject();
      }
    });
  }

  dataURLFromFile (file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        resolve(fileReader.result as string);
      };
      fileReader.onerror = reject;
      fileReader.readAsDataURL(file);
    });
  }

  dataURLFromImg (img: HTMLImageElement): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL();
  }

  downloadFile (file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const imageURL = window.URL.createObjectURL(file);
      if (imageURL) {
        // Trigger download (via DOM link)
        const link = document.createElement('a');
        link.href = imageURL;
        link.download = file.name;
        link.style.position = 'absolute';
        link.style.opacity = '0';
        link.style.top = '-999em';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          link.parentNode.removeChild(link);
          resolve();
        }, 100);
      } else {
        reject();
      }
    });
  }
}
