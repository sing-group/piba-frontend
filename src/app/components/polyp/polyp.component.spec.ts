import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolypComponent } from './polyp.component';

describe('PolypComponent', () => {
  let component: PolypComponent;
  let fixture: ComponentFixture<PolypComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolypComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolypComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
