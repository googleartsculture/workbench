import { TestBed } from '@angular/core/testing';
import { PrettyFocusService } from './pretty-focus.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

describe('PrettyFocusService', () => {
  let service: PrettyFocusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PrettyFocusService,
        { provide: TranslateService, useClass: MockTranslateService },
      ]
    });
    service = TestBed.get(PrettyFocusService);
  });

  it('should create an instance', () => {
    expect(service).toBeDefined();
  });
});
