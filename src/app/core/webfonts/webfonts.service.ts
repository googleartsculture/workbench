import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as webfontloader from 'webfontloader';
import { environment } from '../../../environments/environment';
import { assignIn, isEmpty } from 'lodash';

@Injectable()
export class WebfontsService {

  loaded: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private config = {
    classes: true,
    active: this.fontsLoaded.bind(this),
    inactive: this.fontsLoaded.bind(this),
  };

  constructor() {
    assignIn(this.config, environment.config.fontServices.webfontloaderConfig);
  }

  fontsLoaded(): void {
    this.loaded.next(true);
  }

  init(): void {
    if (
      environment.config &&
      environment.config.fontServices &&
      environment.config.fontServices.webfontloaderConfig
    ) {
      webfontloader.load(this.config);
    }
  }

}
