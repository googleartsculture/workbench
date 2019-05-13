import { TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { TooltipDirective } from './tooltip.directive';
import { TranslationsService } from './../../core/translations/translations.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

class MockElementRef {}
class MockTranslationsService {}

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

describe('TooltipDirective', () => {
  let directive: TooltipDirective;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TooltipDirective,
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: ElementRef, useClass: MockElementRef },
        { provide: TranslationsService, useClass: MockTranslationsService },
      ],
    });
    directive = TestBed.get(TooltipDirective);
  });

  it('should create directive', () => {
    expect(directive).toBeDefined();
  });
});
