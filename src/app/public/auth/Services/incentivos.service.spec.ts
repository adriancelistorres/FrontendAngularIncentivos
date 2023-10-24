import { TestBed } from '@angular/core/testing';

import { IncentivosService } from './incentivos.service';

describe('IncentivosService', () => {
  let service: IncentivosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IncentivosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
