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
  }

  ngOnInit () {
    this.dataService.init();
  }

}
