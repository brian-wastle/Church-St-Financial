import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionsHistoryOverviewComponent } from './transactions-history-overview.component';

describe('TransactionsHistoryOverviewComponent', () => {
  let component: TransactionsHistoryOverviewComponent;
  let fixture: ComponentFixture<TransactionsHistoryOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionsHistoryOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionsHistoryOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
