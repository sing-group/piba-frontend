import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdspaceComponent } from './idspace.component';

describe('IdspaceComponent', () => {
  let component: IdspaceComponent;
  let fixture: ComponentFixture<IdspaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdspaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
