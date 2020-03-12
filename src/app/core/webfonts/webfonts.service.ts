import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as webfontloader from 'webfontloader';

@Injectable()
export class WebfontsService {

  loaded: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private config = {
    classes: true,
    active: this.fontsLoaded.bind(this),
    inactive: this.fontsLoaded.bind(this),
    google: {
      families: ['Google Sans:400,500,700'],
    },
  };

  constructor() {}

  fontsLoaded(): void {
    this.loaded.next(true);
  }

  init(): void {
    webfontloader.load(this.config);
  }
}
