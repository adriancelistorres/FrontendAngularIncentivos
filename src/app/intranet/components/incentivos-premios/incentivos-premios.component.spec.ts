import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncentivosPremiosComponent } from './incentivos-premios.component';

describe('IncentivosPremiosComponent', () => {
  let component: IncentivosPremiosComponent;
  let fixture: ComponentFixture<IncentivosPremiosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IncentivosPremiosComponent]
    });
    fixture = TestBed.createComponent(IncentivosPremiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
