import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContinueWithoutSavingLocationDialogComponent } from './continue-without-saving-location-dialog.component';

describe('ContinueWithoutSavingLocationDialogComponent', () => {
  let component: ContinueWithoutSavingLocationDialogComponent;
  let fixture: ComponentFixture<ContinueWithoutSavingLocationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContinueWithoutSavingLocationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContinueWithoutSavingLocationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
