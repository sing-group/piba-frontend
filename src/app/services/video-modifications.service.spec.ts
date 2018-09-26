import { TestBed, inject } from '@angular/core/testing';

import { VideoModificationsService } from './video-modifications.service';

describe('VideoModificationsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VideoModificationsService]
    });
  });

  it('should be created', inject([VideoModificationsService], (service: VideoModificationsService) => {
    expect(service).toBeTruthy();
  }));
});
