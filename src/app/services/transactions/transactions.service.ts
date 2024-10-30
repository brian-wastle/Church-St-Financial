import { Injectable } from '@angular/core';
import { ApiService } from '../../services/apiGateway/api-gateway.service';
import { InvestmentPerformance, TransactionRecord, TransactionsHistory } from '../../models/api-response.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';  // Import DatePipe

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  dailyPricingData: any[] = [];
  private datePipe: DatePipe;  // Declare a property for DatePipe

  constructor(private apiService: ApiService) {
    this.datePipe = new DatePipe('en-US');  // Initialize DatePipe with desired locale
  }

  fetchTransactions(stockTicker: string): Observable<TransactionRecord[]> {
    return this.apiService.getStockTransactions(stockTicker).pipe(
      map((response: TransactionsHistory) => {
        const transactions = this.apiService.mergeTransactions(response.accountTransactions, response.tickerTransactions);
        return transactions.sort((a, b) => new Date(a.accountTransaction.date).getTime() - new Date(b.accountTransaction.date).getTime());
      })
    );
  }

  fetchCurrentStockPrice(stockTicker: string): Observable<number> {
    return this.apiService.getSingleStock(stockTicker).pipe(
      map(response => {
        this.dailyPricingData = response.priceData;
        const currentPrice = this.dailyPricingData[0].price;
        this.dailyPricingData.reverse();  
        return currentPrice;
      })
    );
  }

  calculateInvestmentPerformance(transactions: TransactionRecord[], currentPrice: number): InvestmentPerformance {
    let totalSpent = 0;
    transactions.forEach(transaction => {
      totalSpent += transaction.accountTransaction.value;
    });
    totalSpent *= -1;
    const totalSharesHeld = this.getTotalSharesHeld(transactions);
    const currentInvestmentValue = totalSharesHeld * currentPrice;

    return {
      totalSpent,
      netProfitLoss: currentInvestmentValue - totalSpent,
      currentInvestmentValue,
      roi: +((currentInvestmentValue - totalSpent) / totalSpent * 100).toFixed(2),
    };
  }

  public getTotalSharesHeld(transactions: TransactionRecord[]): number {
    return transactions.reduce((total, transaction) => {
      return transaction.tickerTransaction.metadata === 'BUY'
        ? total + transaction.tickerTransaction.units
        : total - transaction.tickerTransaction.units;
    }, 0);
  }

  preparePricingChartData(): any {
    const filteredPricingData = this.dailyPricingData;
    const labels = filteredPricingData.map(price => this.datePipe.transform(price.date, 'MM-dd'));
    const prices = filteredPricingData.map(price => price.price);
  
    const chartDataPrices = {
      labels,
      datasets: [{
        label: 'Daily Prices',
        data: prices,
        fill: false,
        borderColor: '#FF5733',
        tension: 0.1
      }]
    };
  
    const chartOptionsPrices = {
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
  
    return { chartDataPrices, chartOptionsPrices };
  }

  prepareAcctChartData(transactions: TransactionRecord[], investmentValue: number): any {
    const labels = transactions.map(tx => this.datePipe.transform(tx.accountTransaction.date, 'MM-dd')); 
    const transactionValues = transactions.map(tx => tx.accountTransaction.value);
    const investmentValues = Array(labels.length).fill(investmentValue);

    return {
      labels,
      datasets: [
        {
          label: 'Account Transactions',
          data: transactionValues,
          borderColor: '#5D8BFA',
        },
        {
          label: 'Current Investment Value',
          data: investmentValues,
          borderColor: '#FF5733',
          borderDash: [5, 5]
        }
      ]
    };
  }
}
