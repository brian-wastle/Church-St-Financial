import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/apiGateway/api-gateway.service';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FieldsetModule } from 'primeng/fieldset';

import { StockResponse, TickerMetadata, PriceData } from '../../models/api-response.model';

@Component({
  selector: 'app-ticker-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ChartModule, SelectButtonModule, SkeletonModule, FieldsetModule],
  templateUrl: './ticker-page.component.html',
  styleUrls: ['./ticker-page.component.scss'],
  providers: [DatePipe]
})
export class TickerPageComponent implements OnInit {
  tickerData: any = null;
  tickerName: string | null = "";
  tickerMetadata: TickerMetadata | null = null;
  errorMessage: string = '';
  chartData: any;
  chartOptions: any;
  chartWidth: string = '66%';  
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

  getStock(ticker: string) {
    this.isLoading = true;
    this.apiService.getSingleStock(ticker).subscribe({
      next: (data: StockResponse) => {
        this.tickerData = data;        

        this.tickerName = String(data.priceData[0]?.name);
        const { sector, industry, website, description } = data.metadata[0]; 
        this.tickerMetadata = { sector, industry, website, description };
  
        this.errorMessage = '';
        this.prepareChartData();
        console.log("Filtered Metadata: ", this.tickerMetadata);
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
    if (this.tickerData && this.tickerData.priceData) {
        const filteredData = this.filterDataByRange(this.tickerData.priceData);
        const labels = filteredData.map((item: PriceData) => {
            const formattedDate = this.datePipe.transform(item.date, 'MM/dd');
            return formattedDate; // item.date is now a string
        });

        const prices = filteredData.map((item: PriceData) => {
            return item.price; // item.price is now a number
        });

        if (labels.length === 0 || prices.length === 0) {
            console.error('No data available for the chart');
            return; // No data to display
        }

        this.chartData = {
            labels: labels,
            datasets: [
                {
                    label: this.tickerName,
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



filterDataByRange(data: PriceData[]) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  let filteredData: PriceData[] = [];

  switch (this.dateRangeFormControl.value) {
      case '1D':
          filteredData = data.slice(-2);
          const futureDay: PriceData = {
              date: this.datePipe.transform(now, 'yyyy-MM-dd') || 'Unknown Date',
              price: 0,
              name: 'Future Price'
          };
          filteredData.push(futureDay);
          break;
      case '5D':
          filteredData = data.slice(-5);
          break;
      case '1M':
          const lastMonth = new Date(now);
          lastMonth.setMonth(now.getMonth() - 1);
          lastMonth.setHours(0, 0, 0, 0);
          filteredData = data.filter((item: PriceData) => new Date(item.date) >= lastMonth);
          break;
      case '6M':
          const lastSixMonths = new Date(now);
          lastSixMonths.setMonth(now.getMonth() - 6);
          lastSixMonths.setHours(0, 0, 0, 0);
          filteredData = data.filter((item: PriceData) => new Date(item.date) >= lastSixMonths);
          break;
      case 'YTD':
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          startOfYear.setHours(0, 0, 0, 0);
          filteredData = data.filter((item: PriceData) => new Date(item.date) >= startOfYear);
          break;
      case '1Y':
          const lastYear = new Date(now);
          lastYear.setFullYear(now.getFullYear() - 1);
          lastYear.setHours(0, 0, 0, 0);
          filteredData = data.filter((item: PriceData) => new Date(item.date) >= lastYear);
          break;
      default:
          filteredData = data.slice(-2);
          break;
  }

  return filteredData;
}



  
}
