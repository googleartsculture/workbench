import { NgxSmartModalService } from 'ngx-smart-modal';
import { RouterTestingModule } from '@angular/router/testing';
import { UtilsService } from './../../../../core/utils/utils.service';
import { NotificationsService } from './../../../../core/notifications/notifications.service';
import { TestBed } from '@angular/core/testing';
import { PropertiesComponent } from './properties.component';
import { DataService } from './../../../../core/data/data.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

class MockNotificationsService {}
class MockUtilsService {}
class MockDataService {
  projectObs = {
    subscribe() {},
  };
  workspaceSeedObs = {
    subscribe() {},
  };
}

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

describe('PropertiesComponent', () => {
  let component: PropertiesComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
      ],
      providers: [
        PropertiesComponent,
        NgxSmartModalService,
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: DataService, useClass: MockDataService },
        { provide: NotificationsService, useClass: MockNotificationsService },
        { provide: UtilsService, useClass: MockUtilsService },
      ],
    });
    component = TestBed.get(PropertiesComponent);
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });
});
