import { TestBed } from '@angular/core/testing';
import { NotificationsService } from './../notifications/notifications.service';
import { DataService } from './data.service';
import { StorageService } from './../storage/storage.service';
import { UtilsService } from '../../core/utils/utils.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

class MockUtilsService {}
class MockStorageService {}
class MockNotifications {}
class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DataService,
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: UtilsService, useClass: MockUtilsService },
        { provide: StorageService, useClass: MockStorageService },
        { provide: NotificationsService, useClass: MockNotifications },
      ]
    });
    service = TestBed.get(DataService);
  });


  it('should create an instance', () => {
    expect(service).toBeDefined();
  });
});
