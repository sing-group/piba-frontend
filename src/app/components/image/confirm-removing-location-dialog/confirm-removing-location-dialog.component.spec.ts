import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmRemovingLocationDialogComponent } from './confirm-removing-location-dialog.component';

describe('ConfirmRemovingLocationDialogComponent', () => {
  let component: ConfirmRemovingLocationDialogComponent;
  let fixture: ComponentFixture<ConfirmRemovingLocationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmRemovingLocationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmRemovingLocationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
