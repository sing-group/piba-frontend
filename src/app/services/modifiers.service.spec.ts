import { TestBed, inject } from '@angular/core/testing';

import { ModifiersService } from './modifiers.service';

describe('ModifiersService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModifiersService]
    });
  });

  it('should be created', inject([ModifiersService], (service: ModifiersService) => {
    expect(service).toBeTruthy();
  }));
});
