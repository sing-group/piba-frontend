import {inject, TestBed} from '@angular/core/testing';

import {IdSpacesService} from './idspaces.service';

describe('IdspacesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IdSpacesService]
    });
  });

  it('should be created', inject([IdSpacesService], (service: IdSpacesService) => {
    expect(service).toBeTruthy();
  }));
});
