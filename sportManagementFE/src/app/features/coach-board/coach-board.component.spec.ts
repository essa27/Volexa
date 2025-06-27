import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamSchedulingComponent } from './coach-board.component';

describe('TeamSchedulingComponent', () => {
  let component: TeamSchedulingComponent;
  let fixture: ComponentFixture<TeamSchedulingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeamSchedulingComponent]
    });
    fixture = TestBed.createComponent(TeamSchedulingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
