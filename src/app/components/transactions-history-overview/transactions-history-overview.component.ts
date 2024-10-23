import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService } from '../../services/apiGateway/api-gateway.service';
import { CognitoService } from '../../services/cognito/cognito.service';
import { AccountTransactionRecord, TickerTransactionRecord, TransactionsHistory, TransactionRecord, InvestmentPerformance } from '../../models/api-response.model';
import { ActivatedRoute } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'transactions-history-overview',
  standalone: true,
  imports: [CommonModule, TableModule, ChartModule, SkeletonModule],
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
    this.userID = '94b8a4d8-20b1-7002-c209-5b0f15ba6d94'; // Remove for production
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
    this.apiService.getStockTransactions(this.userID, this.stockTicker).subscribe((response: TransactionsHistory) => {
      // Get users' account/portfolio transaction history, collate and sort by date, prep chart
      this.transactions = this.mergeTransactions(response.accountTransactions, response.tickerTransactions);
      this.transactions.sort((a, b) => new Date(b.accountTransaction.date).getTime() - new Date(a.accountTransaction.date).getTime());
      this.isLoadingTransactions = false;
      this.prepareAcctChartData();

      // Get daily pricing data for this stock and prep chart
      this.apiService.getSingleStock(this.stockTicker).subscribe(currentPriceData => {
        this.currentStockPrice = currentPriceData.priceData[0].price;
        this.dailyPricingData = currentPriceData.priceData;
        console.log("dailyPricingData: ", this.dailyPricingData);
        this.preparePricingChartData();

        // Calculate invest performance data
        this.investmentPerformance = this.calculateInvestmentPerformance(this.transactions, this.currentStockPrice);

      });

    }, error => {
      console.error('Error loading stock data:', error);
      this.isLoadingTransactions = false;
    });
  }

  private mergeTransactions(accountTransactions: AccountTransactionRecord[], tickerTransactions: TickerTransactionRecord[]): TransactionRecord[] {
    const mergedTransactions: TransactionRecord[] = [];

    accountTransactions.forEach(accountTx => {
      const matchingTickerTx = tickerTransactions.find(tickerTx => tickerTx.uuid === accountTx.uuid);
      if (matchingTickerTx) {
        mergedTransactions.push({
          uuid: accountTx.uuid,
          accountTransaction: accountTx,
          tickerTransaction: matchingTickerTx
        });
      }
    });

    return mergedTransactions;
  }

  private calculateInvestmentPerformance(transactions: TransactionRecord[], currentPrice: number): InvestmentPerformance {
    let totalSpent = 0;
    let totalEarned = 0;
    let currentInvestmentValue = 0;

    // Create a map for daily prices from dailyPricingData
    const dailyPriceMap: { [key: string]: number } = {};
    this.dailyPricingData.forEach(priceData => {
      const date = priceData.date.split('T')[0];
      dailyPriceMap[date] = priceData.price;
    });

    transactions.forEach(transaction => {
      const tickerTx = transaction.tickerTransaction;
      const transactionValue = tickerTx.value * tickerTx.units;

      if (tickerTx.metadata === 'BUY') {
        totalSpent += transactionValue;
      } else if (tickerTx.metadata === 'SELL') {
        totalEarned += transactionValue;
      }
    });

    const totalSharesHeld = this.getTotalSharesHeld();
    currentInvestmentValue = totalSharesHeld * currentPrice;

    return {
      totalSpent,
      totalEarned,
      netProfitLoss: totalEarned - totalSpent,
      currentInvestmentValue,
      roi: totalSpent > 0 ? ((currentInvestmentValue - totalSpent) / totalSpent) * 100 : 0,
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
  
    // Get the date of the earliest transaction
    const earliestTransactionDate = new Date(this.transactions[0].tickerTransaction.date).toISOString().split('T')[0];
  
    // Filter daily pricing data to only include dates from the earliest transaction onward
    const filteredPricingData = this.dailyPricingData.filter(price => price.date.split('T')[0] >= earliestTransactionDate);
    console.log('Filtered Pricing Data:', filteredPricingData);
  
    // Prepare labels and data for the chart
    const labels: string[] = filteredPricingData.map(price => price.date.split('T')[0]);
    const prices: number[] = filteredPricingData.map(price => price.price);
  
    this.chartDataPrices = {
      labels: labels,
      datasets: [{
        label: 'Daily Prices',
        data: prices,
        fill: false,
        borderColor: '#FF5733', // Use any color you prefer
        tension: 0.1
      }]
    };
  
    this.chartOptionsPrices = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          beginAtZero: false, // Set to true if you want the y-axis to start at zero
          ticks: {
            callback: (value: number) => value.toString(),
            padding: 10
          }
        }
      }
    };
  }
  

  private prepareAcctChartData(): void {
    // Ensure transactions are sorted by date for accurate charting
    this.transactions.sort((a, b) => new Date(a.accountTransaction.date).getTime() - new Date(b.accountTransaction.date).getTime());
    
    // Prepare labels and values for account transactions
    const labels: string[] = this.transactions.map(tx => tx.accountTransaction.date.toString().split('T')[0]);
    const transactionValues: number[] = this.transactions.map(tx => tx.accountTransaction.value);
  
    // Create a new array to hold investment value for the same labels
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
          borderColor: '#FF5733', // Use any color you prefer
          tension: 0.1,
          borderDash: [5, 5] // Dotted line for differentiation
        }
      ]
    };
  
    // Chart options remain the same
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
  
}
