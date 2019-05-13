import { TestBed } from '@angular/core/testing';
import { ProcessComponent } from './process.component';
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
  settingsObs = {
    subscribe() {},
  };
}

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

describe('ProcessComponent', () => {
  let component: ProcessComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProcessComponent,
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: DataService, useClass: MockDataService },
      ],
    });
    component = TestBed.get(ProcessComponent);
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });
});
