import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService } from '../../services/apiGateway/api-gateway.service';
import { CognitoService } from '../../services/cognito/cognito.service';
import { AccountTransactionRecord, TickerTransactionRecord, TransactionsHistory } from '../../models/api-response.model';
import { ActivatedRoute } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'transactions-history-overview',
  standalone: true,
  imports: [CommonModule, TableModule, ChartModule],
  templateUrl: './transactions-history-overview.component.html',
  styleUrls: ['./transactions-history-overview.component.scss'], // Corrected styleUrl to styleUrls
  providers: [DatePipe]
})
export class TransactionsHistoryOverview implements OnInit {
  stockTicker: string = '';
  userID: string = '';
  transactions: (AccountTransactionRecord | TickerTransactionRecord)[] = [];
  chartData: any;
  chartOptions: any;

  constructor(
    private apiService: ApiService,
    private cognitoService: CognitoService,
    private datePipe: DatePipe,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.stockTicker = this.route.snapshot.paramMap.get('ticker') || '';
    const currentUser = this.cognitoService.currentUserSignal();
    this.userID = currentUser?.username || '';
    this.userID = '94b8a4d8-20b1-7002-c209-5b0f15ba6d94'; // Remove for production

    if (this.stockTicker && this.userID) {
      this.loadStockData();
    }
  }

  private loadStockData(): void {
    this.apiService.getStockTransactions(this.userID, this.stockTicker).subscribe((response: TransactionsHistory) => {
      console.log('API Response:', response); // Log the response to see its structure
      // Assuming response has accountTransactions and tickerTransactions
      this.transactions = [...response.accountTransactions, ...response.tickerTransactions];
      console.log('Combined Transactions:', this.transactions); // Log the combined transactions
      this.prepareChartData();
    });
  }

  private prepareChartData(): void {
    // Sort transactions by date
    this.transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Convert dates to a readable format
    const labels = this.transactions.map((record) => {
      return this.datePipe.transform(record.date, 'MM/dd') || record.date;
    });

    const prices = this.transactions.map((record) => 'balance' in record ? record.balance : 0); // Use balance if available

    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Transaction History',
          data: prices,
          fill: false,
          borderColor: '#42A5F5',
          tension: 0.1
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      layout: {
        padding: {
          left: 20,
          right: 20,
          top: 30,
          bottom: 30
        }
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 0,
            padding: 10
          },
          grid: {
            display: true,
            drawOnChartArea: true
          }
        },
        y: {
          ticks: {
            beginAtZero: true,
            padding: 10
          },
          grid: {
            display: true,
            drawOnChartArea: true
          }
        }
      }
    };
  }
}
