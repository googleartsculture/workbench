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

import { TestBed } from '@angular/core/testing';
import { GenerateComponent } from './generate.component';
import { DataService } from './../../../../core/data/data.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

class MockDataService {
  projectObs = {
    subscribe() {},
  };
  workspacePositionObs = {
    subscribe() {},
  };
}

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

describe('GenerateComponent', () => {
  let component: GenerateComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GenerateComponent,
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: DataService, useClass: MockDataService },
      ],
    });
    component = TestBed.get(GenerateComponent);
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });
});
