import { TestBed } from '@angular/core/testing';
import { ImageComponent } from './image.component';
import { NotificationsService } from './../../core/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

class MockNotificationsService {}

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

describe('ImageComponent', () => {
  let component: ImageComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ImageComponent,
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: NotificationsService, useClass: MockNotificationsService },
      ],
    });
    component = TestBed.get(ImageComponent);
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });
});
