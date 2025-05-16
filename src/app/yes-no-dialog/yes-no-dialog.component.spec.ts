import { ComponentFixture, TestBed } from '@angular/core/testing';
// Import MatDialogModule here
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

import { YesNoDialogComponent, DialogData } from './yes-no-dialog.component';

describe('YesNoDialogComponent', () => {
  let component: YesNoDialogComponent;
  let fixture: ComponentFixture<YesNoDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<YesNoDialogComponent, boolean>>;

  const mockDialogData: DialogData = {
    question: 'Are you sure?'
  };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        YesNoDialogComponent, // The standalone component being tested
        MatDialogModule,      // Add MatDialogModule to TestBed imports
        NoopAnimationsModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YesNoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the question from MAT_DIALOG_DATA in mat-dialog-content', () => {
    const paragraphElement = fixture.debugElement.query(By.css('mat-dialog-content p')).nativeElement;
    expect(paragraphElement.textContent).toContain(mockDialogData.question);
  });

  it('should have a dialog title "Bestätigung"', () => {
    const titleElement = fixture.debugElement.query(By.css('h2[mat-dialog-title]')).nativeElement;
    expect(titleElement.textContent).toBe('Bestätigung');
  });

  it('should close the dialog with false when "Nein" button is clicked', () => {
    const neinButton = fixture.debugElement.query(By.css('mat-dialog-actions button:not([color="primary"])')).nativeElement;
    neinButton.click();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should close the dialog with true when "Ja" button is clicked', () => {
    const jaButton = fixture.debugElement.query(By.css('mat-dialog-actions button[color="primary"]')).nativeElement;
    jaButton.click();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });
});