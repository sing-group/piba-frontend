import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolypsComponent } from './polyps.component';

describe('PolypsComponent', () => {
  let component: PolypsComponent;
  let fixture: ComponentFixture<PolypsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolypsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolypsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
