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
