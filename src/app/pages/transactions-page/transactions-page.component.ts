import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CognitoService } from '../../services/cognito/cognito.service';
import { TransactionsService } from '../../services/transactions/transactions.service';
import { TransactionRecord, InvestmentPerformance } from '../../models/api-response.model';
import { SellStockComponent } from '../../components/sell-stock/sell-stock.component';
import { BuyStockComponent } from '../../components/buy-stock/buy-stock.component';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { forkJoin } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';


@Component({
  selector: 'transactions-page',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    TableModule, 
    ChartModule, 
    SkeletonModule, 
    CardModule, 
    BuyStockComponent, 
    SellStockComponent, 
    ButtonModule],
  templateUrl: './transactions-page.component.html',
  styleUrls: ['./transactions-page.component.scss'],
  providers: [DatePipe]
})
export class TransactionsPageComponent implements OnInit {
  stockTicker: string = '';
  currentStockPrice: number | null = null;
  transactions: TransactionRecord[] = [];
  investmentPerformance: InvestmentPerformance | null = null;
  chartDataAccount: any;
  chartDataPrices: any;
  chartOptionsAccount: any;
  chartOptionsPrices: any;
  chartWidth: string = '66%';
  chartHeight: string = '400px';
  isLoadingTransactions: boolean = true;
  isLoadingInvestmentPerformance: boolean = false;
  isBuyStockModalVisible: boolean = false;
  isSellStockModalVisible: boolean = false;

  constructor(
    private transactionsService: TransactionsService,
    private cognitoService: CognitoService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.stockTicker = this.route.snapshot.paramMap.get('ticker') || '';
    const currentUser = this.cognitoService.currentUserSignal();
    const userID = currentUser?.username || '';
    
    if (this.stockTicker && userID) {
      this.loadStockData();
    }
    this.updateChartSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateChartSize();
  }

  updateChartSize() {
    if (typeof window !== 'undefined') {
      const windowWidth = window.innerWidth;
      this.chartWidth = `${windowWidth * 0.66}px`;
    }
  }

  private loadStockData(): void {
    this.isLoadingTransactions = true;

    this.transactionsService.fetchTransactions(this.stockTicker).pipe(
      tap(transactions => {
        this.transactions = transactions;
        this.chartDataAccount = this.transactionsService.prepareAcctChartData(transactions, 0);
      }),
      switchMap(transactions =>
        forkJoin({
          price: this.transactionsService.fetchCurrentStockPrice(this.stockTicker),
          transactions: [transactions]
        })
      ),
      tap(({ price, transactions }) => {
        this.currentStockPrice = price;
        const { chartDataPrices, chartOptionsPrices } = this.transactionsService.preparePricingChartData();
        this.chartDataPrices = chartDataPrices;
        this.chartOptionsPrices = chartOptionsPrices;
        this.investmentPerformance = this.transactionsService.calculateInvestmentPerformance(transactions, price);
        this.isLoadingTransactions = false;
      }),
      catchError(error => {
        console.error('Error loading stock data:', error);
        this.isLoadingTransactions = false;
        return [];
      })
    ).subscribe();
  }

  calcTotalSharesHeld() {
    return this.transactionsService.getTotalSharesHeld(this.transactions);
  }

  openBuyStockModal() {
    this.isBuyStockModalVisible = true;
  }
  
  openSellStockModal() {
    this.isSellStockModalVisible = true;
  }

  closeModal() {
    if (this.isBuyStockModalVisible == true) {
      this.isBuyStockModalVisible = false;
    }
    this.isSellStockModalVisible = false;
    window.location.reload();
  }


}
