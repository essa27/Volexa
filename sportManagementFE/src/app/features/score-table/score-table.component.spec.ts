import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreTableComponent } from './score-table.component';

describe('ScoreTableComponent', () => {
  let component: ScoreTableComponent;
  let fixture: ComponentFixture<ScoreTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScoreTableComponent]
    });
    fixture = TestBed.createComponent(ScoreTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
