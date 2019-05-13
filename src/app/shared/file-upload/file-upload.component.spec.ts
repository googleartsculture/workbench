import { TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { FileUploadComponent } from './file-upload.component';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

class MockElementRef {}

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FileUploadComponent,
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: ElementRef, useClass: MockElementRef },
      ],
    });
    component = TestBed.get(FileUploadComponent);
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });
});
