import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
import { HttpClientModule } from '@angular/common/http';
import { NotificationsService } from '../notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

class MockNotificationsService {}

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

describe('ApiService', () => {
  let service: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [
        ApiService,
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: NotificationsService, useClass: MockNotificationsService },
      ],
    });
    service = TestBed.get(ApiService);
  });

  it('should create an instance', () => {
    expect(service).toBeDefined();
  });
});
