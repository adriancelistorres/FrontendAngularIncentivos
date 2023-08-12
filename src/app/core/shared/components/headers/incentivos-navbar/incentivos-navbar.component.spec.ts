import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncentivosNavbarComponent } from './incentivos-navbar.component';

describe('IncentivosNavbarComponent', () => {
  let component: IncentivosNavbarComponent;
  let fixture: ComponentFixture<IncentivosNavbarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IncentivosNavbarComponent]
    });
    fixture = TestBed.createComponent(IncentivosNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
