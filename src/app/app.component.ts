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

import { Component, OnInit } from '@angular/core';

import { DataService } from './core/data/data.service';
import { PrettyFocusService } from './core/pretty-focus/pretty-focus.service';
import { WebfontsService } from './core/webfonts/webfonts.service';
import { BrowserDetectService } from './core/browser-detect/browser-detect.service';
import { TranslationsService } from './core/translations/translations.service';
import { Router, NavigationEnd} from '@angular/router';
import { filter } from 'rxjs/operators';

import { environment } from '../environments/environment';

declare var gtag;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  public projectView: boolean;
  public direction = 'ltr';

  constructor (
    private browserDetectService: BrowserDetectService,
    private prettyFocusService: PrettyFocusService,
    private webfontsService: WebfontsService,
    private translationsService: TranslationsService,
    private dataService: DataService,
    private router: Router
  ) {
    this.browserDetectService.init();
    this.translationsService.init();
    this.webfontsService.init();
    this.prettyFocusService.init();

    // Is touch?
    if ('ontouchstart' in document.documentElement) {
      document.documentElement.classList.add('is-touch');
    }

    // Google Analytics
    const navEndEvent$ = router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    );
    navEndEvent$.subscribe((e: NavigationEnd) => {
      gtag('config', environment.googleAnalytics, {'page_path': e.urlAfterRedirects});
    });

    this.translationsService.direction.subscribe((value) => {
      if (value) {
        this.direction = value;
      }
    });
  }

  ngOnInit () {
    this.dataService.init();
  }

}
