import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/apiGateway/api-gateway.service';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
  selector: 'app-ticker-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ChartModule, SelectButtonModule, SkeletonModule],
  templateUrl: './ticker-page.component.html',
  styleUrls: ['./ticker-page.component.scss'],
  providers: [DatePipe]
})
export class TickerPageComponent implements OnInit {
  tickerData: any = null;
  tickerName: string | null = "";
  errorMessage: string = '';
  chartData: any;
  chartOptions: any;
  chartWidth: string = '100%';  
  chartHeight: string = '400px';
  isLoading: boolean = false;
  dateRangeFormControl: FormControl = new FormControl('1Y');
  ranges: any[] = [
    { label: '1D', value: '1D' },
    { label: '5D', value: '5D' },
    { label: '1M', value: '1M' },
    { label: '6M', value: '6M' },
    { label: 'YTD', value: 'YTD' },
    { label: '1Y', value: '1Y' }
  ];

  constructor(
    private apiService: ApiService,
    private datePipe: DatePipe,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.updateChartSize();
    this.route.paramMap.subscribe(params => {
      this.tickerName = params.get('ticker');
      if (this.tickerName) {
        this.tickerName = this.tickerName.toUpperCase();
        this.getStock(this.tickerName);
      }
    });

    this.dateRangeFormControl.valueChanges.subscribe(() => {
      this.prepareChartData();
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateChartSize();  // Update chart size on window resize
  }

  updateChartSize() {
    if (typeof window !== 'undefined') {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
  
      // Adjust width and height based on window size
      this.chartWidth = `${windowWidth * 0.8}px`;  
      this.chartHeight = `${windowHeight * 0.4}px`;
    }
  }

  getStock(ticker: string) {
    this.isLoading = true;
    this.apiService.getSingleStock(ticker).subscribe({
      next: (data) => {
        this.tickerData = data;
        this.errorMessage = '';
        this.prepareChartData();
        console.log("Data: ",data);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error fetching ticker data';
        this.tickerData = null;
        this.isLoading = false;
      }
    });
  }

  prepareChartData() {
    if (this.tickerData && this.tickerData.data) {
      const filteredData = this.filterDataByRange(this.tickerData.data);

      const labels = filteredData.map((item: any) => {
        const formattedDate = this.datePipe.transform(item.date.S, 'MM/dd');
        return formattedDate;
      });

      const prices = filteredData.map((item: any) => {
        return parseFloat(item.price.N);
      });

      this.chartData = {
        labels: labels,
        datasets: [
          {
            label: 'Stock Price',
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

  filterDataByRange(data: any[]) {
    const now = new Date();
    let filteredData: any[] = [];

    switch (this.dateRangeFormControl.value) {
      case '1D':
        filteredData = data.slice(-2);
        const futureDay = {
          date: { S: this.datePipe.transform(now, 'yyyy-MM-dd') },
          price: { N: 'null' }
        };
        filteredData.push(futureDay);
        break;
      case '5D':
        filteredData = data.slice(-5);
        break;
      case '1M':
        const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
        filteredData = data.filter((item: any) => new Date(item.date.S) >= lastMonth);
        break;
      case '6M':
        const lastSixMonths = new Date(now.setMonth(now.getMonth() - 6));
        filteredData = data.filter((item: any) => new Date(item.date.S) >= lastSixMonths);
        break;
      case 'YTD':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        filteredData = data.filter((item: any) => new Date(item.date.S) >= startOfYear);
        break;
      case '1Y':
        const lastYear = new Date(now.setFullYear(now.getFullYear() - 1));
        filteredData = data.filter((item: any) => new Date(item.date.S) >= lastYear);
        break;
      default:
        filteredData = data.slice(-2);
        break;
    }

    return filteredData;
  }
}
