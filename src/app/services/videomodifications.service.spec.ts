import { TestBed, inject } from '@angular/core/testing';

import { VideomodificationsService } from './videomodifications.service';

describe('VideomodificationsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VideomodificationsService]
    });
  });

  it('should be created', inject([VideomodificationsService], (service: VideomodificationsService) => {
    expect(service).toBeTruthy();
  }));
});
