import { TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

class MockTranslateService {
  get(key: any): any {
    of(key);
  }
}

describe('FooterComponent', () => {
  let component: FooterComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
      ],
      providers: [
        FooterComponent,
        { provide: TranslateService, useClass: MockTranslateService },
      ],
    });
    component = TestBed.get(FooterComponent);
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });
});
