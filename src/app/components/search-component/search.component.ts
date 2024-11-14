import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../services/search/search.service';
import { ApiService } from '../../services/apiGateway/api-gateway.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-search-component',
  standalone: true,
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class SearchComponent implements OnInit {
  searchForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string | null = null; 
  searchResults: any[] = [];
  highlightText: string | null = null;

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
        console.log("Tickers: ", tickers);
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
      console.log("Highlight Text:", this.highlightText); // Debugging
    });
}

onSearch() {
    if (this.searchForm.invalid) {
      this.errorMessage = "Please enter a search term.";
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    const searchTerm = this.searchForm.value.searchTerm;

    this.router.navigate([], {
      queryParams: { highlight: searchTerm },
      queryParamsHandling: 'merge',
    });

    this.searchResults = this.searchService.search(searchTerm);
    console.log("Search Results:", this.searchResults); // Debugging
    this.isLoading = false;
}

  highlightMatches(text: string, highlight: string): string {
    if (!highlight) return text;

    const regex = new RegExp(`(${highlight})`, 'gi'); 
    return text.replace(regex, '<span class="highlighted">$1</span>'); 
  }
}
