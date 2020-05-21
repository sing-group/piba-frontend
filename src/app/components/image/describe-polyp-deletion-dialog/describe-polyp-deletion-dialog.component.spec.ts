import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DescribePolypDeletionDialogComponent } from './describe-polyp-deletion-dialog.component';

describe('DescribePolypDeletionDialogComponent', () => {
  let component: DescribePolypDeletionDialogComponent;
  let fixture: ComponentFixture<DescribePolypDeletionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DescribePolypDeletionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DescribePolypDeletionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
