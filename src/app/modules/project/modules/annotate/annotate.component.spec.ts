import { TestBed } from '@angular/core/testing';
import { AnnotateComponent } from './annotate.component';
import { DataService } from './../../../../core/data/data.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

class MockDataService {
  settingsObs = {
    subscribe() {},
  };
}

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

describe('AnnotateComponent', () => {
  let component: AnnotateComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AnnotateComponent,
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: DataService, useClass: MockDataService },
      ],
    });
    component = TestBed.get(AnnotateComponent);
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });
});
