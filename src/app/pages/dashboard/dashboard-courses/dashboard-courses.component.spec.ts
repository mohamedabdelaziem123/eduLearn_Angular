import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCoursesComponent } from './dashboard-courses.component';

describe('DashboardCoursesComponent', () => {
  let component: DashboardCoursesComponent;
  let fixture: ComponentFixture<DashboardCoursesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardCoursesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
