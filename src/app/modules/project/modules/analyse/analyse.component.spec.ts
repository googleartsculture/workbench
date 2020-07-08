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

import { NgxSmartModalService } from 'ngx-smart-modal';
import { NotificationsService } from './../../../../core/notifications/notifications.service';
import { ApiService } from './../../../../core/api/api.service';
import { TestBed } from '@angular/core/testing';
import { AnalyseComponent } from './analyse.component';
import { DataService } from './../../../../core/data/data.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

class MockDataService {
  projectObs = {
    subscribe () {},
  };
  workspacePositionObs = {
    subscribe () {},
  };
  settingsObs = {
    subscribe () {},
  };
}
class MockApiService {
  servicesEnabledObs = {
    subscribe () {},
  };
}

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

class MockNotificationsService {}

class MockChangeDetectorRef {}

describe('AnalyseComponent', () => {
  let component: AnalyseComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AnalyseComponent,
        NgxSmartModalService,
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: ApiService, useClass: MockApiService },
        { provide: DataService, useClass: MockDataService },
        { provide: NotificationsService, useClass: MockNotificationsService },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
      ],
    });
    component = TestBed.get(AnalyseComponent);
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });
});
