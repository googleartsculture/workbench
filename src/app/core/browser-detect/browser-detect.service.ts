import { Injectable } from '@angular/core';

interface BrowserDetectConfig {
  minVersions: {
    edge: number;
    ie: number;
    ios: number;
    android: number;
  };
  minDimensions: {
    height: number;
    width: number;
  };
}

export interface BrowserDetectData {
  supported: boolean;
  supportInfo: {
    ios: boolean;
    android: boolean;
    ie: boolean;
    edge: boolean;
    dimensions: boolean;
  };
}

@Injectable()
export class BrowserDetectService {

  private config: BrowserDetectConfig = {
    minVersions: {
      edge: 99999,
      ie: 99999,
      ios: 10,
      android: 6,
    },
    minDimensions: {
      height: 549,
      width: 767,
    },
  };

  private data: BrowserDetectData = {
    supported: true,
    supportInfo: {
      ios: false,
      android: false,
      ie: false,
      edge: false,
      dimensions: false,
    },
  };

  constructor () { }

  init (): BrowserDetectData {

    if (this.config.minVersions.ios && this.detectIOSVersion() && this.detectIOSVersion() < this.config.minVersions.ios) {
      this.data.supported = false;
      this.data.supportInfo.ios = true;
    }
    if (this.config.minVersions.android && this.detectAndroidVersion() && this.detectAndroidVersion() < this.config.minVersions.android) {
      this.data.supported = false;
      this.data.supportInfo.android = true;
    }
    if (this.config.minVersions.ie && this.detectIEVersion() && this.detectIEVersion() < this.config.minVersions.ie) {
      this.data.supported = false;
      this.data.supportInfo.ie = true;
    }
    if (this.config.minVersions.edge && this.detectEdgeVersion() && this.detectEdgeVersion() < this.config.minVersions.edge) {
      this.data.supported = false;
      this.data.supportInfo.edge = true;
    }
    if (
      (this.config.minDimensions.width && window.innerWidth < this.config.minDimensions.width) ||
      (this.config.minDimensions.height && window.innerHeight < this.config.minDimensions.height)
    ) {
      this.data.supported = false;
      this.data.supportInfo.dimensions = true;
    }

    if (!this.data.supported) {
      document.documentElement.classList.add('is-unsupported');
    }

    return this.data;
  }

  private detectIEVersion (): number | boolean {
    let version: number | boolean;
    const navUA: string = navigator.userAgent;

    if (navUA.indexOf('MSIE') === -1 && navUA.indexOf('Trident/') === -1) {
      // Not IE
      version = false;
    } else {
      if (navUA.indexOf('MSIE 10.0') !== -1) {
        version = 10;
      } else if (navUA.indexOf('Trident/7.0') !== -1) {
        version = 11;
      }
    }
    return version;
  }

  private detectEdgeVersion (): number | boolean {
    let version: number | boolean;
    const navUA: string = navigator.userAgent;
    const match = navUA.match(/(Edge\/)([0-9\.]*)/);
    if (match) {
      const v = match[2];
      version = parseFloat(v);
    }
    return version;
  }

  private detectIOSVersion (): number | boolean {
    let version: number | boolean = false;
    const navUA: string = navigator.userAgent;

    if (/iP(hone|od|ad)/.test(navUA)) {
      const match = navUA.match(/OS\s(\d+)_(\d+)_?(\d+)?/);
      if (match) {
        const v = `${parseInt(match[1], 10)}.${parseInt(match[2], 10)}`;
        version = parseFloat(v);
      }
    }
    return version;
  }

  private detectAndroidVersion (): number | boolean {
    let version: number | boolean = false;
    const navUA: string = navigator.userAgent;
    const match = navUA.match(/Android\s([0-9\.]*)/);

    if (match) {
      const v = match[1];
      version = parseFloat(v);
    }
    return version;
  }
}
