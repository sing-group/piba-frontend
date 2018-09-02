import {inject, TestBed} from '@angular/core/testing';

import {PolyprecordingsService} from './polyprecordings.service';

describe('PolyprecordingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PolyprecordingsService]
    });
  });

  it('should be created', inject([PolyprecordingsService], (service: PolyprecordingsService) => {
    expect(service).toBeTruthy();
  }));
});
