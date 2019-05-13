import { TestBed } from '@angular/core/testing';
import { GlyphImageComponent } from './glyph-image.component';
import { NotificationsService } from './../../core/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

class MockNotificationsService {}

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

describe('GlyphImageComponent', () => {
  let component: GlyphImageComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GlyphImageComponent,
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: NotificationsService, useClass: MockNotificationsService },
      ],
    });
    component = TestBed.get(GlyphImageComponent);
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });
});
