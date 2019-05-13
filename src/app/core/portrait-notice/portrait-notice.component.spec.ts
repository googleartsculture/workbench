import { TestBed } from '@angular/core/testing';
import { PortraitNoticeComponent } from './portrait-notice.component';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

describe('PortraitNoticeComponent', () => {
  let component: PortraitNoticeComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PortraitNoticeComponent,
        { provide: TranslateService, useClass: MockTranslateService },
      ],
    });
    component = TestBed.get(PortraitNoticeComponent);
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });
});
