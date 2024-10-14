import { Component, Input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ticker-holdings-card',
  standalone: true,
  templateUrl: './ticker-holdings-card.component.html',
  styleUrls: ['./ticker-holdings-card.component.scss'],
  imports: [CardModule, CommonModule]
})
export class TickerHoldingsCard {
  @Input() ticker: string = '';
  @Input() balance: number = 0;
  @Input() price: number = 0;
  @Input() totalValue: number = 0;

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}
}