import { TestBed } from '@angular/core/testing';
import { PageNotFoundComponent } from './page-not-found.component';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

describe('PageNotFoundComponent', () => {
  let component: PageNotFoundComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PageNotFoundComponent,
        { provide: TranslateService, useClass: MockTranslateService },
      ],
    });
    component = TestBed.get(PageNotFoundComponent);
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });
});
