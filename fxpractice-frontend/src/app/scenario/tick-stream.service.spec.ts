/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TickStreamService } from './tick-stream.service';

describe('TickStreamService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TickStreamService]
    });
  });

  it('should ...', inject([TickStreamService], (service: TickStreamService) => {
    expect(service).toBeTruthy();
  }));
});
