import { TestBed, inject } from '@angular/core/testing';

import { PolypsService } from './polyps.service';

describe('PolypsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PolypsService]
    });
  });

  it('should be created', inject([PolypsService], (service: PolypsService) => {
    expect(service).toBeTruthy();
  }));
});
