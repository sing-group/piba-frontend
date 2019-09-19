import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoPolypComponent } from './video-polyp.component';

describe('VideoPolypComponent', () => {
  let component: VideoPolypComponent;
  let fixture: ComponentFixture<VideoPolypComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoPolypComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoPolypComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
