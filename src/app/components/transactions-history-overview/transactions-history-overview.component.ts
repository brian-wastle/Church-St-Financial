import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService } from '../../services/apiGateway/api-gateway.service';
import { CognitoService } from '../../services/cognito/cognito.service';
import { TransactionsHistory, TransactionRecord, InvestmentPerformance } from '../../models/api-response.model';
import { ActivatedRoute } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { BuyStockComponent } from '../buy-stock/buy-stock.component';

@Component({
  selector: 'transactions-history-overview',
  standalone: true,
  imports: [CommonModule, TableModule, ChartModule, SkeletonModule, CardModule, BuyStockComponent, ButtonModule],
  templateUrl: './transactions-history-overview.component.html',
  styleUrls: ['./transactions-history-overview.component.scss'],
  providers: [DatePipe]
})
export class TransactionsHistoryOverview implements OnInit {
  stockTicker: string = '';
  userID: string = '';
  investmentPerformance: InvestmentPerformance | null = null;
  transactions: TransactionRecord[] = [];
  chartDataAccount: any;
  chartOptionsAccount: any;
  chartDataPrices: any;
  chartOptionsPrices: any;
  chartWidth: string = '66%';
  chartHeight: string = '400px';
  currentStockPrice: number | null = null;
  dailyPricingData: any[] = [];
  isLoadingTransactions: boolean = true;
  isLoadingInvestmentPerformance: boolean = false;
  isBuyStockModalVisible: boolean = false;

  constructor(
    private apiService: ApiService,
    private cognitoService: CognitoService,
    private datePipe: DatePipe,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.updateChartSize();
    this.stockTicker = this.route.snapshot.paramMap.get('ticker') || '';
    const currentUser = this.cognitoService.currentUserSignal();
    this.userID = currentUser?.username || '';
    this.userID = '94b8a4d8-20b1-7002-c209-5b0f15ba6d94';                           // Remove for production
    if (this.stockTicker && this.userID) {
      this.loadStockData();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateChartSize();
  }

  updateChartSize() {
    if (typeof window !== 'undefined') {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      this.chartWidth = `${windowWidth * 0.66}px`;
      this.chartHeight = `${Math.max(windowHeight * 0.4, 200)}px`;
    }
  }

  private loadStockData(): void {
    this.isLoadingTransactions = true;
    this.apiService.getStockTransactions(this.stockTicker).subscribe((response: TransactionsHistory) => {
      // Get users' account/portfolio transaction history, collate and sort by date, prep chart
      this.transactions = this.apiService.mergeTransactions(response.accountTransactions, response.tickerTransactions);
      this.transactions.sort((a, b) => new Date(b.accountTransaction.date).getTime() - new Date(a.accountTransaction.date).getTime());
      this.isLoadingTransactions = false;
      this.prepareAcctChartData();

      // Get daily pricing data for this stock and prep chart
      this.apiService.getSingleStock(this.stockTicker).subscribe(currentPriceData => {
        this.currentStockPrice = currentPriceData.priceData[0].price;
        this.dailyPricingData = currentPriceData.priceData;
        this.preparePricingChartData();

        // Calculate invest performance data
        this.investmentPerformance = this.calculateInvestmentPerformance(this.transactions, this.currentStockPrice);

      });

    }, error => {
      console.error('Error loading stock data:', error);
      this.isLoadingTransactions = false;
    });
  }

  private calculateInvestmentPerformance(transactions: TransactionRecord[], currentPrice: number): InvestmentPerformance {
    let totalSpent = 0;
    let currentInvestmentValue = 0;

    // Create a map for daily prices from dailyPricingData
    const dailyPriceMap: { [key: string]: number } = {};
    this.dailyPricingData.forEach(priceData => {
      const date = priceData.date.split('T')[0];
      dailyPriceMap[date] = priceData.price;
    });
    console.log("transactions: ", transactions);
    //totalSpe
    transactions.forEach(transaction => {
      const transactionValue = transaction.accountTransaction.value;
      totalSpent += transactionValue;
    });
    totalSpent *= -1;

    const totalSharesHeld = this.getTotalSharesHeld();
    currentInvestmentValue = totalSharesHeld * currentPrice;

    return {
      totalSpent,
      netProfitLoss: currentInvestmentValue - totalSpent,
      currentInvestmentValue,
      roi: +((currentInvestmentValue - totalSpent)/totalSpent * 100).toFixed(2),
    };
  }

  public getTotalSharesHeld(): number {
    return this.transactions.reduce((total, transaction) => {
      if (transaction.tickerTransaction.metadata === 'BUY') {
        return total + transaction.tickerTransaction.units;
      } else {
        return total - transaction.tickerTransaction.units;
      }
    }, 0);
  }

  private preparePricingChartData(): void {
    if (this.dailyPricingData.length === 0 || this.transactions.length === 0) return;
    const earliestTransactionDate = new Date(this.transactions[0].tickerTransaction.date).toISOString().split('T')[0];
    const filteredPricingData = this.dailyPricingData.filter(price => price.date.split('T')[0] >= earliestTransactionDate);
    const labels: string[] = filteredPricingData.map(price => price.date.split('T')[0]);
    const prices: number[] = filteredPricingData.map(price => price.price);
  
    this.chartDataPrices = {
      labels: labels,
      datasets: [{
        label: 'Daily Prices',
        data: prices,
        fill: false,
        borderColor: '#FF5733',
        tension: 0.1
      }]
    };
  
    this.chartOptionsPrices = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: (value: number) => value.toString(),
            padding: 10
          }
        }
      }
    };
  }
  

  private prepareAcctChartData(): void {
    this.transactions.sort((a, b) => new Date(a.accountTransaction.date).getTime() - new Date(b.accountTransaction.date).getTime());
    const labels: string[] = this.transactions.map(tx => tx.accountTransaction.date.toString().split('T')[0]);
    const transactionValues: number[] = this.transactions.map(tx => tx.accountTransaction.value);
    const investmentValues: number[] = Array(labels.length).fill(this.investmentPerformance?.currentInvestmentValue || 0);
  
    // Prepare the chart data
    this.chartDataAccount = {
      labels: labels,
      datasets: [
        {
          label: 'Account Transactions',
          data: transactionValues,
          fill: false,
          borderColor: '#5D8BFA',
          tension: 0.1
        },
        {
          label: 'Current Investment Value',
          data: investmentValues,
          fill: false,
          borderColor: '#FF5733',
          tension: 0.1,
          borderDash: [5, 5]
        }
      ]
    };
  
    this.chartOptionsAccount = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value: number) => value.toString(),
            padding: 10
          }
        }
      }
    };
  }

  openBuyStockModal() {
    this.isBuyStockModalVisible = true;
  }

  closeBuyStockModal() {
    this.isBuyStockModalVisible = false;
    this.loadStockData();
  }
  
}
