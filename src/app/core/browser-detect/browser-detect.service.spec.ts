import { TestBed } from '@angular/core/testing';
import { BrowserDetectService } from './browser-detect.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

describe('BrowserDetectService', () => {
  let service: BrowserDetectService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BrowserDetectService,
        { provide: TranslateService, useClass: MockTranslateService },
      ]
    });
    service = TestBed.get(BrowserDetectService);
  });

  it('should create an instance', () => {
    expect(service).toBeDefined();
  });
});
