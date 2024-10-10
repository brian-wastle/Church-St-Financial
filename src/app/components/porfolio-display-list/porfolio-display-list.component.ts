import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/apiGateway/api-gateway.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'portfolio-display-list',
  standalone: true,
  templateUrl: './porfolio-display-list.component.html',
  styleUrls: ['./porfolio-display-list.component.scss'],
  imports: [CommonModule]
})
export class PortfolioDisplayList implements OnInit {
  public responseData: string | null = null; // Store the response data
  public error: string | null = null; // Store any error messages

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.apiService.getData().subscribe({
      next: (data: any) => {
        this.responseData = JSON.stringify(data, null, 2);
        this.error = null;
      },
      error: (error) => {
        this.error = 'Error fetching data: ' + error.message;
        this.responseData = null;
      }
    });
  }
}