import { NotificationsService } from './../../../../core/notifications/notifications.service';
import { UtilsService } from './../../../../core/utils/utils.service';
import { FacsimileDownloadModalComponent } from './facsimile-download-modal.component';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

class MockNotificationsService {}
class MockUtilsService {}

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

describe('FacsimileDownloadModalComponent', () => {
  let component: FacsimileDownloadModalComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FacsimileDownloadModalComponent,
        NgxSmartModalService,
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: NotificationsService, useClass: MockNotificationsService },
        { provide: UtilsService, useClass: MockUtilsService },
      ],
    });
    component = TestBed.get(FacsimileDownloadModalComponent);
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });
});
