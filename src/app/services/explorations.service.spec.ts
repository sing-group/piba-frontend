import {inject, TestBed} from '@angular/core/testing';

import {ExplorationsService} from './explorations.service';

describe('ExplorationsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExplorationsService]
    });
  });

  it('should be created', inject([ExplorationsService], (service: ExplorationsService) => {
    expect(service).toBeTruthy();
  }));
});
