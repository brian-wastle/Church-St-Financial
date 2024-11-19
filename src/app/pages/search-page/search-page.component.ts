import { Component } from '@angular/core';
import { SearchComponent } from '../../components/search-component/search.component';
import { SearchTipsComponent } from '../../components/search-tips/search-tips.component';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [SearchComponent, SearchTipsComponent],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss'
})
export class SearchPageComponent {

}
