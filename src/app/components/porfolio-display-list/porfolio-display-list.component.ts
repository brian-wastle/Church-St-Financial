import { Component, OnInit} from '@angular/core';
import { ApiService } from '../../services/apiGateway/api-gateway.service';
import { CommonModule, DatePipe } from '@angular/common';
import { DataViewModule } from 'primeng/dataview';
import { TickerHoldingsCard } from '../ticker-holdings-card/ticker-holdings-card.component';
import { PortfolioItem, ChartData } from '../../models/api-response.model';
import { Subject } from 'rxjs';

@Component({
  selector: 'portfolio-display-list',
  standalone: true,
  templateUrl: './porfolio-display-list.component.html',
  styleUrls: ['./porfolio-display-list.component.scss'],
  imports: [CommonModule, DataViewModule, TickerHoldingsCard],
  providers: [DatePipe]
})
export class PortfolioDisplayList implements OnInit {
  public holdingsData: PortfolioItem[] = [];
  public error: string | null = null;
  public loading: boolean = true;

  private updateHoldingsSubject = new Subject<void>();

  constructor(
    private apiService: ApiService, 
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.apiService.getPortfolio().subscribe({
      next: (data: PortfolioItem[]) => {
        this.holdingsData = data.map(holding => ({
          ...holding,
          totalValue: this.apiService.calcHoldingValue(holding.balance, holding.price),
          chartData: undefined,
          name: undefined,
        }));
        this.error = null;
        this.loading = false;
        this.loadPricingData();
      },
      error: (error) => {
        this.error = 'Fetch error: ' + error.message;
        this.holdingsData = [];
        this.loading = false;
      }
    });
  }

  private loadPricingData(): void {
    this.holdingsData.forEach((item, index) => {
      this.apiService.getSingleStock(item.ticker).subscribe(
        currentPriceData => {
          console.log("currentPriceData: ",currentPriceData);
          const chartData: ChartData = this.preparePricingChartData(currentPriceData.priceData);
          item.chartData = chartData;
          item.name = currentPriceData.priceData[0].name;
          this.updateHoldingsSubject.next();
        },
        error => {
          console.error('Error loading price data:', error);
        }
      );
    });
  }

  private preparePricingChartData(priceData: any[]): ChartData {
    if (priceData.length === 0) return { labels: [], datasets: [] };
  
    const today = new Date();
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
  
    const filteredData = priceData.filter(price => {
      const priceDate = new Date(price.date);
      return priceDate >= threeMonthsAgo && priceDate <= today;
    });
  
    filteredData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const labels: string[] = filteredData.map(price => this.datePipe.transform(price.date, 'MM-dd') || ''); // Use DatePipe here
    const data: number[] = filteredData.map(price => price.price);
  
    return {
      labels: labels,
      datasets: [
        {
          label: 'Price Over Time',
          data: data,
          borderColor: '#42A5F5',
          fill: false,
        }
      ]
    };
  }
  
  trackByTicker(index: number, item: PortfolioItem): string {
    return item.ticker;
  }

  sortByBalance(ascending: boolean): void {
    this.holdingsData.sort((a, b) => ascending ? a.balance - b.balance : b.balance - a.balance);
  }

  sortByPrice(ascending: boolean): void {
    this.holdingsData.sort((a, b) => ascending ? a.price - b.price : b.price - a.price);
  }
}