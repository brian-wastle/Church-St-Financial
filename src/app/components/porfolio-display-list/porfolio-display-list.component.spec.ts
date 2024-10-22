import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioDisplayList } from './porfolio-display-list.component';

describe('PorfolioDisplayListComponent', () => {
  let component: PortfolioDisplayList;
  let fixture: ComponentFixture<PortfolioDisplayList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioDisplayList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioDisplayList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
