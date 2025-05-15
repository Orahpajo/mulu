import { TestBed } from '@angular/core/testing';

import { CommonSongService } from './common-song.service';

describe('CommonSongService', () => {
  let service: CommonSongService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommonSongService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
