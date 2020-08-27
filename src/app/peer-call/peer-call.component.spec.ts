import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeerCallComponent } from './peer-call.component';

describe('PeerCallComponent', () => {
  let component: PeerCallComponent;
  let fixture: ComponentFixture<PeerCallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeerCallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeerCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
