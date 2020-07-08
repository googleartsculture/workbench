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

import { BrowserDetectService } from './core/browser-detect/browser-detect.service';
import { PrettyFocusService } from './core/pretty-focus/pretty-focus.service';
import { WebfontsService } from './core/webfonts/webfonts.service';
import { TranslationsService } from './core/translations/translations.service';
import { DataService } from './core/data/data.service';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

class MockBrowserDetectService {
  init () {}
}

class MockPrettyFocusService {
  init () {}
}

class MockWebfontsService {
  init () {}
}

class MockTranslationsService {
  init () {}
}

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

class MockDataService {}

describe('AppComponent', () => {
  let component: AppComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AppComponent,
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: BrowserDetectService, useClass: MockBrowserDetectService },
        { provide: PrettyFocusService, useClass: MockPrettyFocusService },
        { provide: WebfontsService, useClass: MockWebfontsService },
        { provide: TranslationsService, useClass: MockTranslationsService },
        { provide: DataService, useClass: MockDataService},
      ],
    });
    component = TestBed.get(AppComponent);
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });
});
