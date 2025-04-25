import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongFileComponent } from './song-file.component';

describe('SongFileComponent', () => {
  let component: SongFileComponent;
  let fixture: ComponentFixture<SongFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongFileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SongFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
