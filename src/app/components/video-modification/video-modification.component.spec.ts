import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoModificationComponent } from './video-modification.component';

describe('VideoModificationComponent', () => {
  let component: VideoModificationComponent;
  let fixture: ComponentFixture<VideoModificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoModificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoModificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
