import { TestBed } from '@angular/core/testing';
import { UtilsService } from './utils.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

describe('UtilsService', () => {
  let service: UtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UtilsService,
        { provide: TranslateService, useClass: MockTranslateService },
      ]
    });
    service = TestBed.get(UtilsService);
  });

  it('should create an instance', () => {
    expect(service).toBeDefined();
  });
});
