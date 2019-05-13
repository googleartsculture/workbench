import { DataService } from './core/data/data.service';
import { Component, OnInit } from '@angular/core';
import { PrettyFocusService } from './core/pretty-focus/pretty-focus.service';
import { WebfontsService } from './core/webfonts/webfonts.service';
import { BrowserDetectService } from './core/browser-detect/browser-detect.service';
import { TranslationsService } from './core/translations/translations.service';

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
  ) {
    this.browserDetectService.init();
    this.translationsService.init();
    this.webfontsService.init();
    this.prettyFocusService.init();

    // Is touch?
    if ('ontouchstart' in document.documentElement) {
      document.documentElement.classList.add('is-touch');
    }
  }

  ngOnInit () {
    this.dataService.init();
  }

}
