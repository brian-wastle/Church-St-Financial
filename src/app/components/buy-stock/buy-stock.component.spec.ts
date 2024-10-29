import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyStockComponent } from './buy-stock.component';

describe('BuyStockComponent', () => {
  let component: BuyStockComponent;
  let fixture: ComponentFixture<BuyStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuyStockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuyStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
