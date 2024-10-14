import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/apiGateway/api-gateway.service';
import { CommonModule } from '@angular/common';
import { DataViewModule } from 'primeng/dataview';
import { TickerHoldingsCard } from '../ticker-holdings-card/ticker-holdings-card.component';
import { PortfolioItem } from '../../models/portfolio-item.model';

@Component({
  selector: 'portfolio-display-list',
  standalone: true,
  templateUrl: './porfolio-display-list.component.html',
  styleUrls: ['./porfolio-display-list.component.scss'],
  imports: [CommonModule, DataViewModule, TickerHoldingsCard]
})
export class PortfolioDisplayList implements OnInit {
  public holdingsData: PortfolioItem[] = [];
  public error: string | null = null;
  public loading: boolean = true; // Loading state

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.apiService.getPortfolio().subscribe({
      next: (data: PortfolioItem[]) => {
        this.holdingsData = data.map(holding => ({
          ...holding,
          totalValue: this.apiService.calcHoldingValue(holding.balance, holding.price)
        }));
        this.error = null;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error fetching data: ' + error.message;
        this.holdingsData = [];
        this.loading = false;
      }
    });
  }

  // Sorting functions remain unchanged
  sortByBalance(ascending: boolean): void {
    this.holdingsData.sort((a, b) => ascending ? a.balance - b.balance : b.balance - a.balance);
  }

  sortByPrice(ascending: boolean): void {
    this.holdingsData.sort((a, b) => ascending ? a.price - b.price : b.price - a.price);
  }
}
