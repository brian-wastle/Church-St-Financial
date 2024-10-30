import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/apiGateway/api-gateway.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-sell-stock',
  templateUrl: './sell-stock.component.html',
  styleUrl: './sell-stock.component.scss',
  standalone: true,
  imports: [CommonModule, DialogModule, ReactiveFormsModule, ButtonModule, ProgressSpinnerModule],
})
export class SellStockComponent {
  @Input() ticker!: string;
  @Input() visible: boolean = false;
  @Output() onClose = new EventEmitter<void>();
  
  sellForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;

  unitPattern = /^(0|[1-9][0-9]*)(\.[0-9]{1,2})?$/;

  constructor(
    private fb: FormBuilder, 
    private apiService: ApiService,
    private router: Router
  ) {
    this.sellForm = this.fb.group({
      unitAmount: [
        null,
        [
          Validators.required,
          Validators.min(1),
          Validators.pattern(this.unitPattern)
        ]
      ]
    });
  }

  sellStock() {
    if (this.sellForm.valid) {
      this.loading = true;
      this.errorMessage = null;
      const { unitAmount } = this.sellForm.value;

      this.apiService.sellStock(this.ticker, unitAmount).subscribe({
        next: () => {
          this.loading = false;
          this.onClose.emit();
          this.sellForm.reset();
          this.router.navigate([`/portfolio/${this.ticker}`]);
          // window.location.reload();
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
