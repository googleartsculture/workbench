import { TestBed } from '@angular/core/testing';
import { BrowserDetectComponent } from './browser-detect.component';
import { SvgModule } from '../../shared/svg/svg.module';
import { BrowserDetectService } from './browser-detect.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

import { of } from 'rxjs';

class MockBrowserDetectService {}
class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

describe('BrowserDetectComponent', () => {
  let component: BrowserDetectComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SvgModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        BrowserDetectComponent,
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: BrowserDetectService, useClass: MockBrowserDetectService },
        { provide: TranslateService, useClass: MockTranslateService },
      ],
    });
    component = TestBed.get(BrowserDetectComponent);
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });
});
