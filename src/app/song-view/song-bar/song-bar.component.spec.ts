import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongBarComponent } from './song-bar.component';

describe('SongBarComponent', () => {
  let component: SongBarComponent;
  let fixture: ComponentFixture<SongBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SongBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
