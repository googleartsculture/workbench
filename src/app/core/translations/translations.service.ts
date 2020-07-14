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


import {take} from 'rxjs/operators';
import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable ,  Subscription ,  BehaviorSubject } from 'rxjs';

import { environment } from '../../../environments/environment';
import { dir } from 'console';

@Injectable()
export class TranslationsService implements OnDestroy {

  private i18n: Subscription;
  private i18nSub: BehaviorSubject<any> = new BehaviorSubject(null);
  private directionSub: BehaviorSubject<string> = new BehaviorSubject(null);
  i18nObs: Observable<any> = this.i18nSub.asObservable();
  direction: Observable<string> = this.directionSub.asObservable();

  constructor(
    private translateService: TranslateService
  ) { }

  ngOnDestroy () {
    if (this.i18n) {
      this.i18n.unsubscribe();
    }
  }

  private setDirection(lang: string): void {
    let direction: string;
    if (environment.config.localisation.rtlLangs.indexOf(lang) > -1) {
      direction = 'rtl';
    } else {
      direction = 'ltr';
    }
    this.directionSub.next(direction);
  }

  public init (): void {
    this.i18n = this.translateService.onLangChange.subscribe(l => {
      if (!l || !l.lang) { return; }
      this.setDirection(l.lang);
      this.translateService.getTranslation(l.lang).pipe(
        take(1))
        .subscribe(t => this.i18nSub.next(t));
    });
    this.translateService.addLangs(environment.config.localisation.langs);
    this.translateService.use(environment.config.localisation.default);

    const browserLang = this.translateService.getBrowserLang();
    const langRegExp = new RegExp(environment.config.localisation.langs.join('|'), 'gi');
    this.translateService.use(browserLang.match(langRegExp) ? browserLang : environment.config.localisation.default);
  }
}
