import { TestBed } from '@angular/core/testing';
import { TranslationsService } from './translations.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

describe('TranslationsService', () => {
  let service: TranslationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      providers: [
        TranslationsService,
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: TranslateService, useClass: MockTranslateService },
      ],
    });
    service = TestBed.get(TranslationsService);
  });

  it('should create an instance', () => {
    expect(service).toBeDefined();
  });
});
