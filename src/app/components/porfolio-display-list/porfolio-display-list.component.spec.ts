import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PorfolioDisplayListComponent } from './porfolio-display-list.component';

describe('PorfolioDisplayListComponent', () => {
  let component: PorfolioDisplayListComponent;
  let fixture: ComponentFixture<PorfolioDisplayListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PorfolioDisplayListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PorfolioDisplayListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
