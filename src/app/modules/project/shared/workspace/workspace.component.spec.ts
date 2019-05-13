import { UtilsService } from './../../../../core/utils/utils.service';
import { ApiService } from './../../../../core/api/api.service';
import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { WorkspaceComponent } from './workspace.component';
import { NotificationsService } from './../../../../core/notifications/notifications.service';
import { DataService } from './../../../../core/data/data.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

class MockChangeDetectorRef {}
class MockDataService {
  projectObs = {
    subscribe() {},
  };
}

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

class MockApiService {}
class MockUtilsService {}
class MockNotificationsService {}

describe('WorkspaceComponent', () => {
  let component: WorkspaceComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WorkspaceComponent,
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: DataService, useClass: MockDataService },
        { provide: ApiService, useClass: MockApiService },
        { provide: UtilsService, useClass: MockUtilsService },
        { provide: NotificationsService, useClass: MockNotificationsService },
      ],
    });
    component = TestBed.get(WorkspaceComponent);
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });
});
