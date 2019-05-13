import { TestBed } from '@angular/core/testing';
import { WebfontsService } from './webfonts.service';

describe('WebfontsService', () => {
  let service: WebfontsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WebfontsService,
      ]
    });
    service = TestBed.get(WebfontsService);
  });

  it('should create an instance', () => {
    expect(service).toBeDefined();
  });
});
