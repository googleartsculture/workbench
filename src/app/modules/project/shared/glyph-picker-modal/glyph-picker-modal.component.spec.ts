import { NgxSmartModalService } from 'ngx-smart-modal';
import { TestBed } from '@angular/core/testing';
import { GlyphPickerModalComponent } from './glyph-picker-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

describe('GlyphPickerModalComponent', () => {
  let component: GlyphPickerModalComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GlyphPickerModalComponent,
        NgxSmartModalService,
        { provide: TranslateService, useClass: MockTranslateService },
      ],
    });
    component = TestBed.get(GlyphPickerModalComponent);
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });
});
