import { TestBed } from '@angular/core/testing';
import { NotificationsComponent } from './notifications.component';
import { NotificationsService } from './notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

class MockNotificationsService {}

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotificationsComponent,
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: NotificationsService, useClass: MockNotificationsService },
      ],
    });
    component = TestBed.get(NotificationsComponent);
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });
});
