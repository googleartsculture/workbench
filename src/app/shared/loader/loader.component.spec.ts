import { TestBed } from '@angular/core/testing';
import { LoaderComponent } from './loader.component';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

describe('LoaderComponent', () => {
  let component: LoaderComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoaderComponent,
        { provide: TranslateService, useClass: MockTranslateService },
      ],
    });
    component = TestBed.get(LoaderComponent);
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });
});
