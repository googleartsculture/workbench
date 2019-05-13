import { ApiService } from './../api/api.service';
import { DataService } from './../data/data.service';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from './header.component';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

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

class MockApiService {
  servicesEnabledObs = {
    subscribe() {},
  };
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
      ],
      providers: [
        HeaderComponent,
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: DataService, useClass: MockDataService },
        { provide: ApiService, useClass: MockApiService },
      ],
    });
    component = TestBed.get(HeaderComponent);
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });
});
