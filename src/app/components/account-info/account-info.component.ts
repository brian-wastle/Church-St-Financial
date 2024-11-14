import { Component, ChangeDetectorRef, Signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/apiGateway/api-gateway.service';
import { CognitoService } from '../../services/cognito/cognito.service';
import { PortfolioItem, TransactionRecord, TransactionsHistory } from '../../models/api-response.model';

@Component({
  selector: 'app-account-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss']
})
export class AccountInfoComponent {
  holdingsData: PortfolioItem[] = [];
  transactions: TransactionRecord[] = [];
  currentUser: Signal<any>;
  isLoggedIn;
  error: string | null = null;
  loading: boolean | null = null;
  currentBalance: number | null = 0;
  totalInvestmentValue: number = 0; // New property to store the sum of totalValue

  constructor(
    private cognitoService: CognitoService,
    private apiService: ApiService,
    private cdRef: ChangeDetectorRef
  ) {
    this.currentUser = this.cognitoService.currentUserSignal;
    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.onUserLogin(user);
      }
      this.cdRef.markForCheck();  // Explicitly trigger change detection
    });
    this.isLoggedIn = computed(() => !!this.currentUser());
  }

  private onUserLogin(user: any): void {
    this.loading = true;
    this.apiService.getAccountBalance().subscribe({
      next: (data: any) => {
        this.currentBalance = data.balance;
        this.error = null;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Fetch error: ' + error.message;
        this.loading = false;
      }
    });
    this.apiService.getPortfolio().subscribe({
      next: (data: PortfolioItem[]) => {
        this.holdingsData = data.map(holding => ({
          ...holding,
          totalValue: this.apiService.calcHoldingValue(holding.balance, holding.price),
          name: undefined,
          totalInvestment: undefined,
        }));
        this.loadPricingData();
        this.calcInvestmentTotal();
        this.error = null;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Fetch error: ' + error.message;
        this.holdingsData = [];
        this.loading = false;
      }
    });
  }

  private async loadPricingData(): Promise<void> {
    const priceDataPromises = this.holdingsData.map(async (item) => {
      try {
        const currentPriceData = await this.apiService.getSingleStock(item.ticker).toPromise();
        if (currentPriceData && currentPriceData.priceData && currentPriceData.priceData.length > 0) {
          item.name = currentPriceData.priceData[0].name;
        }
      } catch (error) {
        console.error('Error loading price data:', error);
      }
    });
    await Promise.all(priceDataPromises);
    this.holdingsData.forEach((item) => {
      this.loadTransactionData(item.ticker);
    });
  }
  


  private loadTransactionData(ticker: string): void {
    this.apiService.getStockTransactions(ticker).subscribe((response: TransactionsHistory) => {
      this.transactions = this.apiService.mergeTransactions(response.accountTransactions, response.tickerTransactions);
      this.transactions.sort((a, b) => new Date(b.accountTransaction.date).getTime() - new Date(a.accountTransaction.date).getTime());
      const totalInvestment = this.calcTotalInvestment(this.transactions);
      const holding = this.holdingsData.find(h => h.ticker === ticker);
      if (holding) {
        holding.totalInvestment = totalInvestment;
      }
    }, error => {
      console.error('Error loading stock data:', error);
    });
  }
  private calcTotalInvestment(transactions: any[]): number {
    const totalValue = transactions.reduce((sum, transaction) => {
      return sum + transaction.accountTransaction.value;
    }, 0);
    return totalValue * -1;
  }

  private calcInvestmentTotal(): void {
    this.totalInvestmentValue = this.holdingsData.reduce((total, item) => {
      return total + (item.totalValue || 0);
    }, 0);
  }
}

