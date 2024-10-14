import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TickerHoldingsCardComponent } from './ticker-holdings-card.component';

describe('TickerHoldingsCardComponent', () => {
  let component: TickerHoldingsCardComponent;
  let fixture: ComponentFixture<TickerHoldingsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TickerHoldingsCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TickerHoldingsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
