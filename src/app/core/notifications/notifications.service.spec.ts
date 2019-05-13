import { TestBed } from '@angular/core/testing';
import { NotificationsService } from './notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotificationsService,
        { provide: TranslateService, useClass: MockTranslateService },
      ]
    });
    service = TestBed.get(NotificationsService);
  });

  it('should create an instance', () => {
    expect(service).toBeDefined();
  });
});
