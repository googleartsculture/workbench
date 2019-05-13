import { ActivatedRoute } from '@angular/router';
import { DataService } from './../../core/data/data.service';
import { TestBed } from '@angular/core/testing';
import { ProjectComponent } from './project.component';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

class MockActivatedRoute {
  params = {
    subscribe() {},
  };
}

class MockDataService {
  projectObs = {
    subscribe() {},
  };
}

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

describe('ProjectComponent', () => {
  let component: ProjectComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProjectComponent,
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
        { provide: DataService, useClass: MockDataService },
      ],
    });
    component = TestBed.get(ProjectComponent);
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });
});
