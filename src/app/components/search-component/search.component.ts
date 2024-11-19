import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../services/search/search.service';
import { ApiService } from '../../services/apiGateway/api-gateway.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-search-component',
  standalone: true,
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, RouterLink]
})
export class SearchComponent implements OnInit {
  searchForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string | null = null; 
  searchResults: any[] = [];
  highlightText: string | null = null;
  searchTerm: string | null = null;

  constructor(
    private searchService: SearchService,
    private apiService: ApiService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router 
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
    });
  }

  ngOnInit() {
    this.apiService.getStockTickers().subscribe({
      next: (tickers) => {
        this.searchService.setDocuments(tickers);
      },
      error: (error) => {
        console.error('Error fetching stock tickers:', error);
      },
      complete: () => {
        console.log('Stock tickers fetching complete');
      }
    });

    this.route.queryParams.subscribe(params => {
      this.highlightText = params['highlight'] || null;
  
      if (this.highlightText) {
        this.searchForm.patchValue({ searchTerm: this.highlightText });
        this.onSearch();
      }
    });
}

onSearch() {
    if (this.searchForm.invalid) {
      this.errorMessage = "Please enter a search term.";
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.searchTerm = this.searchForm.value.searchTerm;

    if (!this.searchTerm) {
      return;
    }

    this.router.navigate([], {
      queryParams: { highlight: this.searchTerm },
      queryParamsHandling: 'merge',
    });
    var searchTermFuzzy = this.searchTerm.concat('~1 ', this.searchTerm, '* *', this.searchTerm);
    this.searchResults = this.searchService.search(searchTermFuzzy);
    this.isLoading = false;
}

  highlightMatches(text: string, highlight: string): string {
    if (!highlight) return text;

    const regex = new RegExp(`(${highlight})`, 'gi'); 
    return text.replace(regex, '<span class="highlighted">$1</span>'); 
  }
}
