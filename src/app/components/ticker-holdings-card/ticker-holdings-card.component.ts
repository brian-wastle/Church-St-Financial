import { Component, HostListener, OnInit, Input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { ChartData } from '../../models/api-response.model';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'ticker-holdings-card',
  standalone: true,
  templateUrl: './ticker-holdings-card.component.html',
  styleUrls: ['./ticker-holdings-card.component.scss'],
  imports: [CardModule, CommonModule, ChartModule]
})
export class TickerHoldingsCard implements OnInit {
  @Input() ticker: string = '';
  @Input() balance: number = 0;
  @Input() price: number = 0;
  @Input() totalValue: number = 0;
  @Input() chartData?: ChartData;
  @Input() name?: string;

  chartWidth: string = '50%';  // Default width
  chartHeight: string = '100px'; 

  ngOnInit() {
    this.updateChartSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateChartSize();
  }

  updateChartSize() {
    if (typeof window !== 'undefined') {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      this.chartWidth = `${windowWidth * 0.5}px`;  
      this.chartHeight = `${Math.min(windowHeight * 0.5, 200)}px`;
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  chartOptions = {
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
}
