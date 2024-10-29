import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/apiGateway/api-gateway.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-buy-stock',
  templateUrl: './buy-stock.component.html',
  styleUrl: './buy-stock.component.scss',
  standalone: true,
  imports: [CommonModule, DialogModule, ReactiveFormsModule, ButtonModule, ProgressSpinnerModule],
})
export class BuyStockComponent {
  @Input() ticker!: string;
  @Input() visible: boolean = false;
  @Output() onClose = new EventEmitter<void>();
  
  buyForm: FormGroup;
  loading = false; // Tracks API request status
  errorMessage: string | null = null; // Holds any error message

  dollarPattern = /^[0-9]+(\.[0-9]{1,2})?$/;

  constructor(
    private fb: FormBuilder, 
    private apiService: ApiService,
  ) {
    this.buyForm = this.fb.group({
      dollarAmount: [
        null,
        [
          Validators.required,
          Validators.min(1),
          Validators.pattern(this.dollarPattern)
        ]
      ]
    });
  }

  buyStock() {
    if (this.buyForm.valid) {
      this.loading = true;
      this.errorMessage = null; // Clear any previous errors
      const { dollarAmount } = this.buyForm.value;

      this.apiService.buyStock(this.ticker, dollarAmount).subscribe({
        next: () => {
          this.loading = false;
          this.onClose.emit();
          this.buyForm.reset();
          window.location.reload();
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = 'An error occurred while buying stock. Please try again.';
        }
      });
    }
  }

  onDialogClose() {
    this.onClose.emit();
  }
}
