import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoZoneEditorComponent } from './video-zone-editor.component';

describe('VideoZoneEditorComponent', () => {
  let component: VideoZoneEditorComponent;
  let fixture: ComponentFixture<VideoZoneEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoZoneEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoZoneEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
