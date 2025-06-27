import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AthleteListComponent } from './athlete-list.component';

describe('AthleteListComponent', () => {
  let component: AthleteListComponent;
  let fixture: ComponentFixture<AthleteListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AthleteListComponent]
    });
    fixture = TestBed.createComponent(AthleteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
