import { Component, HostListener, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { ChartData } from '../../models/api-response.model';
import { ChartModule } from 'primeng/chart';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'ticker-holdings-card',
  standalone: true,
  templateUrl: './ticker-holdings-card.component.html',
  styleUrls: ['./ticker-holdings-card.component.scss'],
  imports: [CardModule, CommonModule, ChartModule, RouterModule]
})
export class TickerHoldingsCard implements OnInit, OnChanges {
  @Input() ticker: string = '';
  @Input() balance: number = 0;
  @Input() price: number = 0;
  @Input() totalValue: number = 0;
  @Input() chartData?: ChartData;
  @Input() name?: string;
  @Input() minPrice?: number;
  @Input() maxPrice?: number; 
  @Input() investment?: number = 0;

  changeInValue: number = 0;
  roi: number = 0;

  chartWidth: string = '50%';
  chartHeight: string = '100px'; 

  chartOptions: any = {
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
        beginAtZero: true,
        min: undefined, 
        max: undefined,
        ticks: {
          padding: 10
        },
        grid: {
          display: true,
          drawOnChartArea: true
        }
      }
    }
  };

  ngOnInit() {
    this.updateChartSize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.minPrice !== undefined && this.maxPrice !== undefined) {
      this.updateChartOptions();
    }

    if (this.investment && this.totalValue) {
      this.roi = this.calcROI(this.totalValue, this.investment)
      this.changeInValue = this.calcChangeInValue(this.totalValue, this.investment)
    }
  }

  calcROI(profit: number, cost: number): number {
    return +((profit - cost) / cost * 100).toFixed(2);
  }

  calcChangeInValue(profit: number, cost: number) {
    return profit - cost;
  }

  updateChartOptions() {
    if (this.minPrice !== undefined && this.maxPrice !== undefined) {
      this.chartOptions.scales.y.min = this.minPrice;
      this.chartOptions.scales.y.max = this.maxPrice;
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

      this.chartWidth = `${windowWidth * 1/3}px`;  
      this.chartHeight = `${Math.min(windowHeight * 0.5, 200)}px`;

      if (windowWidth <= 768) {
        this.chartWidth = `${windowWidth * 1/2}px`;  
      }
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }
}
