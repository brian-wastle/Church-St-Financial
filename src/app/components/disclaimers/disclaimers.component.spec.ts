import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisclaimersComponent } from './disclaimers.component';

describe('DisclaimersComponent', () => {
  let component: DisclaimersComponent;
  let fixture: ComponentFixture<DisclaimersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisclaimersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisclaimersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
